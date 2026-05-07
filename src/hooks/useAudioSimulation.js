import { useState, useRef, useCallback, useEffect } from 'react';
import { WS_URL } from '@/lib/utils';

const SILENCE_THRESHOLD = 0.012;
const SILENCE_DURATION_MS = 1800;
const MIN_AUDIO_BYTES = 6000;
const MAX_RECONNECTS = 3;
const RECONNECT_DELAY_MS = 1500;

function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export function useAudioSimulation() {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState([]);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const activeRef = useRef(false);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const mimeTypeRef = useRef('');
  const reconnectCountRef = useRef(0);

  const playNextAudio = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      currentAudioRef.current = null;
      return;
    }
    isPlayingRef.current = true;
    const blob = audioQueueRef.current.shift();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudioRef.current = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudioRef.current = null;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'audio_done' }));
      }
      setStatus('listening');
      playNextAudio();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudioRef.current = null;
      setStatus('listening');
      playNextAudio();
    };
    audio.play().catch(() => {
      currentAudioRef.current = null;
      setStatus('listening');
      playNextAudio();
    });
  }, []);

  const startSilenceDetection = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const buf = new Float32Array(analyser.frequencyBinCount);

    const check = () => {
      if (!activeRef.current) return;
      analyser.getFloatTimeDomainData(buf);
      const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);

      if (rms > SILENCE_THRESHOLD) {
        isSpeakingRef.current = true;
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        // Interrupt AI audio the moment user speaks
        if (isPlayingRef.current && currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
          audioQueueRef.current = [];
          isPlayingRef.current = false;
          setStatus('listening');
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'audio_done' }));
          }
        }
      } else if (isSpeakingRef.current && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          isSpeakingRef.current = false;
          silenceTimerRef.current = null;
          // Stop the recorder — onstop will send the blob and restart it
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, SILENCE_DURATION_MS);
      }

      animFrameRef.current = requestAnimationFrame(check);
    };

    animFrameRef.current = requestAnimationFrame(check);
  }, []);

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current) return; // already set up — reconnect reuses it
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const mimeType = mimeTypeRef.current;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Each stop gives a complete, self-contained audio segment with its own header
        const chunks = chunksRef.current.splice(0);
        if (chunks.length > 0 && activeRef.current) {
          const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          if (blob.size >= MIN_AUDIO_BYTES && wsRef.current?.readyState === WebSocket.OPEN) {
            const buffer = await blob.arrayBuffer();
            wsRef.current.send(buffer);
          }
        }
        // Restart immediately for next utterance
        if (activeRef.current && mediaRecorderRef.current?.state === 'inactive') {
          recorder.start();
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      startSilenceDetection();
    } catch (err) {
      setError('Microphone access denied: ' + err.message);
    }
  }, [startSilenceDetection]);

  const connectWS = useCallback((sessionId, token) => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        audioQueueRef.current.push(event.data);
        if (!isPlayingRef.current) playNextAudio();
        return;
      }

      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      switch (msg.type) {
        case 'auth_ok': {
          const _meta = (() => { try { return JSON.parse(localStorage.getItem('pitchroom_session_meta') || '{}'); } catch { return {}; } })();
          ws.send(JSON.stringify({
            type: 'start_session',
            session_id: sessionId,
            audio_mime_type: mimeTypeRef.current,
            voice: _meta.voice || 'onyx',
          }));
          break;
        }
        case 'session_ready':
          reconnectCountRef.current = 0;
          setError(null);
          setStatus('listening');
          startRecording();
          break;
        case 'transcript':
          setTranscript((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), speaker: msg.speaker, text: msg.text },
          ]);
          break;
        case 'scores':
          setScores(msg.scores);
          break;
        case 'status':
          setStatus(msg.status);
          break;
        case 'error':
          setError(msg.message);
          break;
      }
    };

    ws.onerror = () => {
      // onerror always precedes onclose — handle retry there
    };

    ws.onclose = () => {
      if (!activeRef.current) return;
      if (reconnectCountRef.current < MAX_RECONNECTS) {
        reconnectCountRef.current += 1;
        setStatus('connecting');
        setError(`Connection dropped. Reconnecting (${reconnectCountRef.current}/${MAX_RECONNECTS})...`);
        setTimeout(() => {
          if (activeRef.current) connectWS(sessionId, token);
        }, RECONNECT_DELAY_MS * reconnectCountRef.current);
      } else {
        setError('Connection lost. Please refresh and try again.');
        setStatus('ended');
      }
    };
  }, [playNextAudio, startRecording]);

  const connect = useCallback(async (sessionId, token) => {
    setStatus('connecting');
    setTranscript([]);
    setScores(null);
    setError(null);
    activeRef.current = true;
    reconnectCountRef.current = 0;
    mimeTypeRef.current = getSupportedMimeType();

    connectWS(sessionId, token);
  }, [connectWS]);

  const disconnect = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    wsRef.current?.close();
    setStatus('idle');
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return { status, transcript, scores, error, connect, disconnect };
}

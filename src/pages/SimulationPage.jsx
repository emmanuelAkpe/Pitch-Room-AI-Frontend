import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Phone, Pause, Loader2, Mic, Brain, Volume2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Waveform from '@/components/Waveform';
import { useAudioSimulation } from '@/hooks/useAudioSimulation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const SCORE_LABELS = {
  problem_clarity: 'Problem Clarity',
  value_proposition: 'Value Proposition',
  market_size: 'Market Size',
  competitors: 'Competitors',
  monetization: 'Monetization',
  go_to_market: 'Go-to-Market',
  defensibility: 'Defensibility',
  founder_credibility: 'Founder Credibility',
};

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef(null);
  const start = () => {
    ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };
  const stop = () => clearInterval(ref.current);
  const fmt = () => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  useEffect(() => () => stop(), []);
  return { start, stop, fmt };
}

function StatusLabel({ status }) {
  const cfg = {
    connecting: { label: 'Connecting...', icon: Loader2, spin: true, color: 'text-white/40' },
    listening: { label: 'Listening', icon: Mic, spin: false, color: 'text-orange-400' },
    processing: { label: 'Processing audio...', icon: Loader2, spin: true, color: 'text-white/40' },
    thinking: { label: 'Analyzing your pitch...', icon: Brain, spin: false, color: 'text-blue-400' },
    speaking: { label: 'Speaking', icon: Volume2, spin: false, color: 'text-emerald-400' },
    ended: { label: 'Session ended', icon: Radio, spin: false, color: 'text-white/30' },
    idle: { label: 'Ready', icon: Mic, spin: false, color: 'text-white/30' },
  };
  const c = cfg[status] || cfg.idle;
  const Icon = c.icon;
  return (
    <div className={cn('flex items-center gap-2 text-sm font-medium', c.color)}>
      <Icon size={15} className={c.spin ? 'animate-spin' : ''} />
      {c.label}
    </div>
  );
}

export default function SimulationPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { status, transcript, scores, error, connect, disconnect } = useAudioSimulation();
  const transcriptRef = useRef(null);
  const timer = useTimer();
  const [ending, setEnding] = useState(false);

  const meta = (() => {
    try { return JSON.parse(localStorage.getItem('pitchroom_session_meta') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    connect(sessionId, token);
    timer.start();
  }, [sessionId]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleEnd = async () => {
    setEnding(true);
    disconnect();
    timer.stop();
    let xpState = {};
    try {
      const result = await api.endSession(sessionId);
      if (result?.xp_earned) {
        xpState = {
          xpEarned: result.xp_earned,
          newBadges: result.new_badges || [],
          newLevel: result.user_level,
          leveledUp: result.leveled_up || false,
          goalsCompleted: result.goals_completed || [],
        };
      }
    } catch {}
    navigate(`/results/${sessionId}`, { state: xpState });
  };

  const isActive = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'thinking' || status === 'processing';

  return (
    <div className="h-screen bg-background text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-2">
          <Rocket className="text-orange-500" size={18} />
          <span className="font-bold text-sm tracking-tight">PitchRoom AI</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white/50 font-mono">{timer.fmt()}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {meta.startupName || 'Pitch Session'}
          </Badge>
          <Badge className="text-xs">{meta.mode === 'elevator' ? '⚡' : meta.mode === 'deep' ? '🧪' : '🔥'} {meta.mode || 'vc'}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => {}}>
            <Pause size={13} /> Pause
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEnd} disabled={ending}>
            {ending ? <Loader2 size={13} className="animate-spin" /> : <Phone size={13} />}
            End Call
          </Button>
        </div>
      </header>

      {/* 3-column layout */}
      <main className="flex-1 grid grid-cols-[280px_1fr_280px] overflow-hidden">
        {/* LEFT: Transcript */}
        <aside className="border-r border-white/5 flex flex-col overflow-hidden min-h-0">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Live Transcript</h2>
          </div>
          <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {transcript.length === 0 ? (
              <p className="text-xs text-white/20 text-center mt-8">Speak to begin your pitch...</p>
            ) : (
              transcript.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', entry.speaker === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                      entry.speaker === 'user'
                        ? 'bg-orange-500/20 text-white border border-orange-500/20'
                        : 'bg-white/6 text-white/80 border border-white/6'
                    )}
                  >
                    <div className={cn('text-[10px] font-semibold mb-1', entry.speaker === 'user' ? 'text-orange-400' : 'text-white/40')}>
                      {entry.speaker === 'user' ? 'You' : 'Investor'}
                    </div>
                    {entry.text}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </aside>

        {/* CENTER: AI Presence */}
        <section className="flex flex-col items-center justify-center gap-6 p-8 overflow-hidden min-h-0">
          {error && (
            <div className="w-full max-w-sm rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className={cn(
            'relative w-24 h-24 rounded-full border-2 overflow-hidden transition-all duration-500',
            isSpeaking ? 'border-emerald-500 shadow-lg shadow-emerald-500/30' :
            isActive ? 'border-orange-500 shadow-lg shadow-orange-500/30' :
            isThinking ? 'border-blue-500 shadow-lg shadow-blue-500/20' :
            'border-white/10'
          )}>
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${meta.mode || 'pia'}`}
              alt="AI investor"
              className="w-full h-full object-cover bg-white/5"
            />
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/40 animate-ping" />
            )}
          </div>

          <div className="text-center">
            <div className="font-semibold text-sm">
              {meta.mode === 'elevator' ? 'Alex Chen' : meta.mode === 'deep' ? 'Marcus Wei' : 'Sarah Volkov'}
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              {meta.mode === 'elevator' ? 'Angel Investor' : meta.mode === 'deep' ? 'Deep Tech VC' : 'Managing Partner'}
            </div>
          </div>

          {/* Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cn('px-4 py-2 rounded-full text-xs', isThinking ? 'shimmer border border-blue-500/20' : 'bg-white/5 border border-white/8')}
            >
              <StatusLabel status={status} />
            </motion.div>
          </AnimatePresence>

          {/* Waveform */}
          <Waveform
            isActive={isActive || isSpeaking}
            mode={isSpeaking ? 'pia' : 'user'}
            className="w-80"
          />

          {/* Last PIA line */}
          {transcript.filter((t) => t.speaker === 'pia').length > 0 && (
            <motion.div
              key={transcript.filter((t) => t.speaker === 'pia').at(-1)?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xs text-center text-sm text-white/50 italic leading-relaxed"
            >
              "{transcript.filter((t) => t.speaker === 'pia').at(-1)?.text}"
            </motion.div>
          )}
        </section>

        {/* RIGHT: Intelligence */}
        <aside className="border-l border-white/5 flex flex-col overflow-hidden min-h-0">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-semibold">Live Intelligence</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!scores ? (
              <p className="text-xs text-white/20 text-center mt-8">Waiting for your first pitch...</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(SCORE_LABELS).map(([key, label]) => {
                  const val = Math.round((scores[key] || 0));
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-white/50">{label}</span>
                        <span className="text-xs font-semibold text-orange-400">{val}%</span>
                      </div>
                      <Progress value={val} className="h-1" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

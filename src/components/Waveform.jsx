import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const BAR_COUNT = 24;

export default function Waveform({ isActive = false, mode = 'pia', className }) {
  const barsRef = useRef([]);
  const frameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const animate = (timestamp) => {
      timeRef.current = timestamp;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        let height;
        if (isActive) {
          const phase = (timestamp / 300) + (i * 0.5);
          const noise = Math.sin(phase) * 0.5 + Math.sin(phase * 2.3) * 0.3 + Math.sin(phase * 0.7) * 0.2;
          height = 20 + noise * 60;
        } else {
          height = 8 + Math.sin((timestamp / 1200) + i * 0.4) * 4;
        }
        bar.style.height = `${Math.max(4, height)}%`;
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive]);

  const barColor = mode === 'user'
    ? 'bg-white'
    : 'bg-orange-500';

  return (
    <div className={cn('flex items-center justify-center gap-0.5', className)} style={{ height: 48 }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          className={cn('w-1 rounded-full transition-opacity duration-300', barColor, isActive ? 'opacity-100' : 'opacity-25')}
          style={{ height: '20%' }}
        />
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Loader2, ChevronRight, Zap, Flame, FlaskConical, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const PERSONAS = [
  {
    id: 'elevator',
    icon: Zap,
    title: 'Elevator Pitch',
    desc: 'Quick, focused practice. Cover the essentials in under 3 minutes.',
    difficulty: 'Beginner',
    difficultyColor: 'text-emerald-400',
    persona: 'Alex Chen',
    role: 'Angel Investor',
    defaultVoice: 'echo',
  },
  {
    id: 'vc',
    icon: Flame,
    title: 'Skeptical VC',
    desc: 'Hard pushback on every assumption. Tests your market and unit economics.',
    difficulty: 'Advanced',
    difficultyColor: 'text-orange-400',
    persona: 'Sarah Volkov',
    role: 'Managing Partner',
    defaultVoice: 'nova',
  },
  {
    id: 'deep',
    icon: FlaskConical,
    title: 'Deep Tech',
    desc: 'PhD-level technical grilling. Defend your architecture and IP.',
    difficulty: 'Expert',
    difficultyColor: 'text-purple-400',
    persona: 'Marcus Wei',
    role: 'Deep Tech VC',
    defaultVoice: 'onyx',
  },
];

const VOICES = [
  { id: 'onyx',    label: 'Deep',    desc: 'Male · Authoritative' },
  { id: 'echo',    label: 'Clear',   desc: 'Male · Crisp' },
  { id: 'nova',    label: 'Warm',    desc: 'Female · Natural' },
  { id: 'shimmer', label: 'Bright',  desc: 'Female · Expressive' },
];

const SCORE_LABELS = {
  problem_clarity: 'Problem Clarity', value_proposition: 'Value Proposition',
  market_size: 'Market Size', competitors: 'Competitors',
  monetization: 'Monetization', go_to_market: 'Go-to-Market',
  defensibility: 'Defensibility', founder_credibility: 'Founder Credibility',
};

const LEVEL_NAMES = {
  1: 'Rookie Founder', 2: 'Pitch Apprentice', 3: 'Angel Ready',
  4: 'VC Contender', 5: 'Series A', 6: 'Unicorn Caliber',
};

export default function SetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'vc';
  const isChallenge = searchParams.get('challenge') === 'true';
  const [startupName, setStartupName] = useState(searchParams.get('startup') || '');
  const [mode, setMode] = useState(initialMode);
  const [voice, setVoice] = useState(PERSONAS.find(p => p.id === initialMode)?.defaultVoice || 'onyx');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeGoals, setActiveGoals] = useState(null);

  const selectedPersona = PERSONAS.find((p) => p.id === mode);

  useEffect(() => {
    api.me().then(u => { setUser(u); setActiveGoals(u.active_goals || null); }).catch(() => {});
  }, []);

  // Sync voice to persona's default when investor changes
  useEffect(() => {
    if (selectedPersona) setVoice(selectedPersona.defaultVoice);
  }, [mode]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!startupName.trim()) {
      setError('Enter your startup name to continue');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const session = await api.createSession({ mode, startup_name: startupName.trim(), voice });
      localStorage.setItem('pitchroom_session_meta', JSON.stringify({
        startupName: startupName.trim(),
        mode,
        voice,
        sessionId: session.id,
        persona: `${selectedPersona?.persona} · ${selectedPersona?.role}`,
      }));
      navigate(`/simulation/${session.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 no-underline text-white">
          <Rocket className="text-orange-500" size={20} />
          <span className="font-bold tracking-tight">PitchRoom AI</span>
        </Link>
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">Dashboard</Button>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Set up your pitch session</h1>
          <p className="text-white/40 mb-10">Choose your investor and tell us about your startup.</p>

          {/* Level challenge banner */}
          {isChallenge && user && (
            <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
              <div className="text-[10px] uppercase tracking-widest text-yellow-400/70 font-semibold mb-1">Level Challenge</div>
              <div className="text-sm font-semibold text-white/80 mb-1.5">
                {LEVEL_NAMES[user.level || 1]} → {LEVEL_NAMES[(user.level || 1) + 1] || 'Unicorn Caliber'}
              </div>
              <div className="text-xs text-white/45 leading-relaxed">
                Score higher to earn XP and advance your level. Your investor mode has been pre-selected.
              </div>
            </div>
          )}

          {/* Active goals brief */}
          {activeGoals?.goals?.some(g => !g.completed) && (
            <div className="mb-8 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-orange-400/70 font-semibold mb-0.5">Active Training Goals</div>
                  <div className="text-sm font-semibold text-white/75">Focus on these areas this session</div>
                </div>
                <button
                  type="button"
                  onClick={() => { api.saveGoals({ goals: [] }).catch(() => {}); setActiveGoals(null); }}
                  className="text-[11px] text-white/25 hover:text-white/50 transition-colors flex-shrink-0 mt-0.5"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 mb-3">
                {activeGoals.goals.filter(g => !g.completed).map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-orange-400 font-bold">→</span>
                    <span className="text-white/65 font-medium">{g.title}</span>
                    <span className="text-white/30">· {SCORE_LABELS[g.dimension] || g.dimension}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-orange-400/50 font-medium">
                Target: {activeGoals.target_score}+ per dimension to complete each goal
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleStart} className="space-y-8">
            {/* Startup name */}
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-3">Startup Name</label>
              <Input
                placeholder="e.g. Acme AI"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                className="text-base h-12"
                required
              />
            </div>

            {/* Persona cards */}
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-widest mb-3">Investor Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const selected = mode === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setMode(p.id)}
                      className={cn(
                        'relative text-left rounded-xl p-5 border transition-all duration-200 cursor-pointer',
                        selected
                          ? 'border-orange-500/60 bg-orange-500/8 shadow-lg shadow-orange-500/10'
                          : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
                      )}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500" />
                      )}
                      <Icon size={22} className={cn('mb-3', selected ? 'text-orange-400' : 'text-white/40')} />
                      <div className="font-semibold text-sm mb-1">{p.title}</div>
                      <div className="text-xs text-white/40 mb-3 leading-relaxed">{p.desc}</div>
                      <div className={cn('text-xs font-semibold', p.difficultyColor)}>{p.difficulty}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona + Voice picker */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4">
              <div className="flex items-center gap-4">
                <motion.img
                  key={mode}
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${mode}`}
                  alt={selectedPersona?.persona}
                  className="w-10 h-10 rounded-full bg-white/10 shrink-0"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  key={`${mode}-name`}
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-sm font-semibold">{selectedPersona?.persona}</div>
                  <div className="text-xs text-white/35 mt-0.5">{selectedPersona?.role}</div>
                </motion.div>
              </div>

              {/* Voice selector */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 size={12} className="text-white/30" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Voice</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {VOICES.map((v) => {
                    const selected = voice === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoice(v.id)}
                        className={cn(
                          'flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all duration-150',
                          selected
                            ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                            : 'border-white/8 bg-white/3 text-white/40 hover:border-white/15 hover:text-white/60'
                        )}
                      >
                        <span className="text-xs font-semibold">{v.label}</span>
                        <span className="text-[10px] opacity-60 mt-0.5">{v.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating session...</>
                : <>Start Pitch Session <ChevronRight size={16} /></>}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

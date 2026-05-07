import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, ArrowLeft, CheckCircle2, Loader2, AlertTriangle,
  Sparkles, ChevronDown, ChevronUp, TrendingUp, Lock, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  'Strong Pass': { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', ring: '#10b981' },
  'Soft Pass':   { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',       ring: '#3b82f6' },
  'Consider':    { color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',   ring: '#f97316' },
  'Pass':        { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         ring: '#ef4444' },
};

const SCORE_LABELS = {
  problem_clarity:     'Problem Clarity',
  value_proposition:   'Value Proposition',
  market_size:         'Market Size',
  competitors:         'Competitors',
  monetization:        'Monetization',
  go_to_market:        'Go-to-Market',
  defensibility:       'Defensibility',
  founder_credibility: 'Founder Credibility',
};

const PERSONA = {
  elevator: { name: 'Alex Chen',    role: 'Angel Investor'   },
  deep:     { name: 'Marcus Wei',   role: 'Deep Tech VC'     },
  vc:       { name: 'Sarah Volkov', role: 'Managing Partner' },
};

const LEVEL_NAMES = {
  1: 'Rookie Founder', 2: 'Pitch Apprentice', 3: 'Angel Ready',
  4: 'VC Contender',   5: 'Series A',         6: 'Unicorn Caliber',
};

// Minimum score per dimension to complete a goal, per level
const LEVEL_TARGET = { 1: 45, 2: 55, 3: 60, 4: 70, 5: 75, 6: 80 };

// XP required per level threshold
const LEVEL_XP = [0, 0, 200, 500, 1000, 2000, 5000];

// Recommended investor mode for each level challenge
const CHALLENGE_MODE = { 1: 'elevator', 2: 'vc', 3: 'vc', 4: 'deep', 5: 'deep' };

const BADGE_CONFIG = {
  first_pitch:    { icon: '🎯', label: 'First Pitch'    },
  survivor:       { icon: '💪', label: 'Survivor'       },
  vc_gauntlet:    { icon: '🔥', label: 'VC Gauntlet'    },
  deep_diver:     { icon: '🧪', label: 'Deep Diver'     },
  high_scorer:    { icon: '⭐', label: 'High Scorer'    },
  investor_ready: { icon: '🏆', label: 'Investor Ready' },
  triple_threat:  { icon: '🎓', label: 'Triple Threat'  },
  perfectionist:  { icon: '💎', label: 'Perfectionist'  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRoadmap(overall, actionPlan) {
  const icons = ['🎯', '💡', '🛡️'];
  const trainingGoals = (actionPlan || []).map((item, i) => ({
    id: `goal_${i}`,
    type: 'goal',
    icon: icons[i] || '📋',
    title: item.title,
    subtitle: SCORE_LABELS[item.dimension] || item.dimension,
    dimension: item.dimension,
    drill: item.drill,
    xp: 75,
    status: 'active',
  }));

  return [
    {
      id: 'first_pitch', type: 'milestone', icon: '🎯',
      title: 'First Blood', subtitle: 'Completed a full pitch session',
      desc: 'You survived your first round with an AI investor. The journey begins.',
      xp: 50, status: 'complete',
    },
    ...trainingGoals,
    {
      id: 'score_70', type: 'milestone', icon: '⭐',
      title: 'Series Seed', subtitle: 'Score 70+ in a session',
      desc: 'Demonstrate pitch quality consistent enough to earn a second meeting.',
      xp: 100, status: overall >= 70 ? 'complete' : 'locked',
    },
    {
      id: 'all_modes', type: 'milestone', icon: '🎭',
      title: 'Three Paths', subtitle: 'Face all 3 investor types',
      desc: 'Complete sessions with Alex (Angel), Sarah (VC), and Marcus (Deep Tech).',
      xp: 150, status: 'locked',
    },
    {
      id: 'score_80', type: 'milestone', icon: '🏆',
      title: 'A-Round Ready', subtitle: 'Score 80+ in a session',
      desc: 'Deliver a pitch strong enough to move an investor toward a term sheet.',
      xp: 200, status: overall >= 80 ? 'complete' : 'locked',
    },
    {
      id: 'investor_ready', type: 'boss', icon: '💎',
      title: 'Investor Ready', subtitle: 'The final milestone',
      desc: "Score 85+, master all dimensions, and face every investor type.",
      xp: 500, status: overall >= 85 ? 'complete' : 'locked',
    },
  ];
}

function xpToNextLevel(xp, level) {
  const next = LEVEL_XP[level + 1];
  if (!next) return null;
  return Math.max(0, next - xp);
}

function xpProgress(xp, level) {
  const curr = LEVEL_XP[level] || 0;
  const next = LEVEL_XP[level + 1] || LEVEL_XP[6];
  if (!next || next <= curr) return 100;
  return Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100));
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ overall, cfg }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * overall));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [overall]);

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <motion.circle
          cx="32" cy="32" r={r} fill="none"
          stroke={cfg.ring} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (overall / 100) * circ }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-lg font-black leading-none', cfg.color)}>{display}</span>
      </div>
    </div>
  );
}

// ── Roadmap node ──────────────────────────────────────────────────────────────

function RoadmapNode({ item, isLast, targetScore, index }) {
  const [expanded, setExpanded] = useState(item.status === 'active' && item.type === 'goal');

  const isComplete = item.status === 'complete';
  const isActive   = item.status === 'active';
  const isLocked   = item.status === 'locked';
  const isBoss     = item.type === 'boss';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center w-10 flex-shrink-0">
        <div className={cn(
          'relative flex items-center justify-center flex-shrink-0 transition-all duration-300 z-10',
          isBoss ? 'w-11 h-11 rounded-xl' : 'w-9 h-9 rounded-full',
          isComplete ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.4)]' :
          isActive   ? 'bg-orange-500/15 border-2 border-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.35)]' :
          isBoss     ? 'bg-yellow-500/10 border-2 border-yellow-500/25' :
                       'bg-white/[0.03] border-2 border-white/8',
        )}>
          <span className={cn(
            'text-sm font-bold flex items-center',
            isComplete ? 'text-emerald-400' : isActive ? 'text-orange-300' :
            isBoss ? 'text-yellow-500/40' : 'text-white/20',
          )}>
            {isComplete ? '✓' : isLocked ? <Lock size={12} /> : '→'}
          </span>
          {isActive && (
            <span className="absolute inset-0 rounded-full border-2 border-orange-400/25 animate-ping" />
          )}
        </div>
        {!isLast && (
          <div className={cn(
            'w-px flex-1 mt-1.5 min-h-5',
            isComplete ? 'bg-emerald-500/25' : isActive ? 'bg-orange-500/15' : 'bg-white/5',
          )} />
        )}
      </div>

      <div className={cn(
        'flex-1 mb-3 rounded-2xl border transition-all',
        isComplete ? 'border-emerald-500/20 bg-emerald-500/[0.04]' :
        isActive   ? 'border-orange-500/20 bg-orange-500/[0.04]' :
        isBoss     ? 'border-yellow-500/15 bg-yellow-500/[0.03] opacity-60' :
                     'border-white/5 bg-transparent opacity-40',
      )}>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{item.icon}</span>
              <div>
                <div className={cn(
                  'text-xs font-bold tracking-widest uppercase',
                  isComplete ? 'text-emerald-400' : isActive ? 'text-orange-300' :
                  isBoss ? 'text-yellow-400/50' : 'text-white/20',
                )}>
                  {item.title}
                </div>
                <div className="text-[11px] text-white/35 mt-0.5">{item.subtitle}</div>
              </div>
            </div>
            {item.xp && (
              <span className={cn(
                'text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border',
                isComplete ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                isActive   ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' :
                isBoss     ? 'bg-yellow-500/10 text-yellow-500/50 border-yellow-500/20' :
                             'bg-white/5 text-white/20 border-white/8',
              )}>
                +{item.xp} XP
              </span>
            )}
          </div>

          {/* Training goal body */}
          {item.type === 'goal' && (
            <div className="mt-3">
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    key="drill"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-white/55 leading-relaxed pb-2">{item.drill}</p>
                    <div className="flex items-center gap-1.5 pb-1">
                      <Zap size={10} className="text-orange-400/60" />
                      <span className="text-[10px] text-orange-400/70 font-semibold">
                        Unlocks when you score {targetScore}+ on this dimension next session
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setExpanded(e => !e)}
                className="mt-2 flex items-center gap-1 text-xs text-orange-400/50 hover:text-orange-400 transition-colors"
              >
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {expanded ? 'Hide exercise' : 'View training exercise'}
              </button>
            </div>
          )}

          {/* Milestone / boss body */}
          {item.type !== 'goal' && (
            <p className="text-xs text-white/35 leading-relaxed mt-2.5">{item.desc}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [session, setSession] = useState(null);
  const [report, setReport]   = useState(null);
  const [user, setUser]       = useState(null);
  const [showStats, setShowStats] = useState(false);

  const {
    xpEarned = 0, newBadges = [], newLevel, leveledUp = false,
    goalsCompleted = [],
  } = location.state || {};

  useEffect(() => {
    (async () => {
      try {
        const [s, u] = await Promise.all([api.getSession(sessionId), api.me()]);
        setSession(s);
        setReport(s.final_report || null);
        setUser(u);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 size={28} className="animate-spin text-orange-400 mx-auto" />
        <p className="text-sm text-white/40">Generating your debrief...</p>
      </div>
    </div>
  );

  if (error || !session) return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <AlertTriangle size={28} className="text-red-400 mx-auto" />
        <p className="text-sm text-white/60">{error || 'Session not found'}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>← Dashboard</Button>
      </div>
    </div>
  );

  const scores  = report?.scores || session.scores || {};
  const overall = report?.overall_score ?? Math.round(
    Object.values(scores).reduce((s, v, _, a) => a.length ? s + v / a.length : s, 0)
  );
  const rec     = report?.recommendation || 'Consider';
  const cfg     = VERDICT_CONFIG[rec] || VERDICT_CONFIG['Consider'];
  const mode    = session.mode || 'vc';
  const persona = PERSONA[mode] || PERSONA.vc;

  const userLevel    = user?.level || 1;
  const targetScore  = LEVEL_TARGET[userLevel] || 45;
  const roadmap      = buildRoadmap(overall, report?.action_plan);
  const trainingGoals = roadmap.filter(r => r.type === 'goal');
  const completedCount = roadmap.filter(r => r.status === 'complete').length;

  const modeLabel = mode === 'elevator' ? 'Elevator Pitch' : mode === 'deep' ? 'Deep Dive' : 'VC Round';
  const dateStr   = session.ended_at
    ? new Date(session.ended_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Today';

  const handleAccept = async () => {
    const goalData = {
      from_session_id: sessionId,
      level: userLevel,
      target_score: targetScore,
      goals: trainingGoals.map(g => ({
        id: g.id,
        dimension: g.dimension || '',
        title: g.title,
        completed: false,
      })),
    };
    try { await api.saveGoals(goalData); } catch {}
    const params = new URLSearchParams({ mode });
    if (session?.startup_name) params.set('startup', session.startup_name);
    navigate(`/setup?${params}`);
  };

  const handleLevelChallenge = () => {
    const challengeMode = CHALLENGE_MODE[userLevel] || 'vc';
    const params = new URLSearchParams({ mode: challengeMode, challenge: 'true' });
    if (session?.startup_name) params.set('startup', session.startup_name);
    navigate(`/setup?${params}`);
  };

  return (
    <div className="h-screen bg-background text-white flex flex-col overflow-hidden">

      {/* Nav */}
      <nav className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-background/95">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="flex items-center gap-1.5">
          <Rocket className="text-orange-500" size={14} />
          <span className="font-bold text-sm tracking-tight">PitchRoom AI</span>
        </div>
        <button
          onClick={() => setShowStats(s => !s)}
          className={cn('flex items-center gap-1.5 text-xs transition-colors', showStats ? 'text-white/70' : 'text-white/30 hover:text-white/60')}
        >
          <TrendingUp size={12} /> Stats
        </button>
      </nav>

      {/* Hero */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <ScoreRing overall={overall} cfg={cfg} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base truncate">{session.startup_name || 'Pitch Session'}</h1>
              <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border', cfg.bg, cfg.color)}>
                {rec}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1">{modeLabel} · {dateStr}</p>
            {(xpEarned > 0 || leveledUp || newBadges.length > 0 || goalsCompleted.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {xpEarned > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold">
                    <Sparkles size={10} /> +{xpEarned} XP
                  </motion.span>
                )}
                {leveledUp && newLevel && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/8 border border-white/15 text-white/70 font-semibold">
                    ⬆ {LEVEL_NAMES[newLevel] || `Level ${newLevel}`}
                  </motion.span>
                )}
                {newBadges.map((b, i) => {
                  const bc = BADGE_CONFIG[b] || { icon: '🏅', label: b };
                  return (
                    <motion.span key={b} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 + i * 0.1, type: 'spring' }}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                      {bc.icon} {bc.label}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Investor verdict */}
      {report?.reasoning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex-shrink-0 px-6 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="max-w-2xl mx-auto flex gap-3 items-start">
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${mode}`} alt={persona.name}
              className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white/45 mb-1">{persona.name} · {persona.role}</div>
              <blockquote className={cn('text-xs leading-relaxed italic opacity-90 line-clamp-2', cfg.color)}>
                "{report.reasoning}"
              </blockquote>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="flex-shrink-0 border-b border-white/5 overflow-hidden">
            <div className="px-6 py-4">
              <div className="max-w-2xl mx-auto">
                <div className="text-[10px] text-white/35 uppercase tracking-widest font-semibold mb-3">Performance Stats</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {Object.entries(SCORE_LABELS).map(([key, label]) => {
                    const val = Math.round(scores[key] || 0);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/45">{label}</span>
                          <span className={cn('font-bold', val >= 70 ? 'text-emerald-400' : val >= 50 ? 'text-orange-400' : 'text-red-400')}>{val}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={cn('h-full rounded-full', val >= 70 ? 'bg-emerald-500' : val >= 50 ? 'bg-orange-500' : 'bg-red-500')}
                            initial={{ width: 0 }} animate={{ width: `${val}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap — scrollable */}
      <main className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
        <div className="max-w-2xl mx-auto">

          {/* Goals completed banner */}
          {goalsCompleted.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  {goalsCompleted.length} training goal{goalsCompleted.length > 1 ? 's' : ''} completed!
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                You hit the target on {goalsCompleted.map(g => g.title).join(' and ')}. New goals unlocked below.
              </p>
            </motion.div>
          )}

          {/* Board header */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Your Roadmap</div>
              <div className="text-base font-semibold text-white/75 mt-0.5">
                Path to <span className={cfg.color}>Investor Ready</span>
              </div>
            </div>
            <div className="text-right leading-none">
              <span className="text-2xl font-black">{completedCount}</span>
              <span className="text-white/25 text-lg font-bold">/{roadmap.length}</span>
              <div className="text-[10px] uppercase tracking-wide text-white/30 mt-1">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: cfg.ring }}
              initial={{ width: '2%' }}
              animate={{ width: `${Math.max(2, (completedCount / roadmap.length) * 100)}%` }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.4 }}
            />
          </div>

          {/* Roadmap items */}
          {roadmap.map((item, i) => (
            <RoadmapNode
              key={item.id}
              item={item}
              index={i}
              isLast={i === roadmap.length - 1}
              targetScore={targetScore}
            />
          ))}

        </div>
      </main>

      {/* Sticky action bar — always visible */}
      {user && (
        <div className="flex-shrink-0 border-t border-white/8 bg-background px-6 py-4">
          <div className="max-w-2xl mx-auto space-y-3">

            {/* Level XP progression */}
            {userLevel < 6 && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/35 shrink-0 tabular-nums w-8">Lv.{userLevel}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="font-semibold text-white/60">{LEVEL_NAMES[userLevel]}</span>
                    <span className="text-white/30">
                      {xpToNextLevel(user.xp || 0, userLevel) ?? 0} XP to {LEVEL_NAMES[userLevel + 1]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress(user.xp || 0, userLevel)}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 h-8 px-3 text-xs border-white/15 text-white/55 hover:text-white hover:border-white/30"
                  onClick={handleLevelChallenge}
                >
                  <Zap size={11} /> Level Up
                </Button>
              </div>
            )}

            {/* Training goals CTA */}
            {trainingGoals.length > 0 && (
              <div className={`flex items-center justify-between gap-4 ${userLevel < 6 ? 'pt-3 border-t border-white/5' : ''}`}>
                <div className="text-xs text-white/40 min-w-0">
                  <span className="font-semibold text-white/65">{trainingGoals.length} training goal{trainingGoals.length > 1 ? 's' : ''}</span>
                  <span className="ml-1">· +{trainingGoals.length * 75} XP on completion</span>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm shrink-0" onClick={handleAccept}>
                  Begin Training →
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

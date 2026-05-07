import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Plus, Clock, ChevronRight, LogOut, Loader2, Award, Layers, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  elevator: { label: 'Elevator', icon: '⚡' },
  vc: { label: 'Skeptical VC', icon: '🔥' },
  deep: { label: 'Deep Tech', icon: '🧪' },
};

const SCORE_LABELS_SHORT = {
  problem_clarity: 'PC', value_proposition: 'VP', market_size: 'MS',
  competitors: 'CO', monetization: 'MO', go_to_market: 'GM',
  defensibility: 'DE', founder_credibility: 'FC',
};

const LEVEL_NAMES = {
  1: 'Rookie Founder', 2: 'Pitch Apprentice', 3: 'Angel Ready',
  4: 'VC Contender', 5: 'Series A', 6: 'Unicorn Caliber',
};

const LEVEL_XP = [0, 0, 200, 500, 1000, 2000, 5000];

const SCORE_LABELS = {
  problem_clarity: 'Problem Clarity', value_proposition: 'Value Proposition',
  market_size: 'Market Size', competitors: 'Competitors',
  monetization: 'Monetization', go_to_market: 'Go-to-Market',
  defensibility: 'Defensibility', founder_credibility: 'Founder Credibility',
};

const BADGE_CONFIG = {
  first_pitch: { icon: '🎯', label: 'First Pitch' },
  survivor: { icon: '💪', label: 'Survivor' },
  vc_gauntlet: { icon: '🔥', label: 'VC Gauntlet' },
  deep_diver: { icon: '🧪', label: 'Deep Diver' },
  high_scorer: { icon: '⭐', label: 'High Scorer' },
  investor_ready: { icon: '🏆', label: 'Investor Ready' },
  triple_threat: { icon: '🎓', label: 'Triple Threat' },
  perfectionist: { icon: '💎', label: 'Perfectionist' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function avgScore(scores) {
  if (!scores) return null;
  const vals = Object.values(scores).filter((v) => typeof v === 'number');
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getSessionScore(s) {
  return s.final_report?.overall_score ?? avgScore(s.scores) ?? null;
}

function computeStats(sessions) {
  const ended = sessions.filter(s => s.ended_at);
  if (!ended.length) return null;
  const scores = ended.map(getSessionScore).filter(v => v !== null);
  if (!scores.length) return null;
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = Math.max(...scores);
  const modeCount = ended.reduce((acc, s) => { acc[s.mode] = (acc[s.mode] || 0) + 1; return acc; }, {});
  const topMode = Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { total: ended.length, avg, best, topMode };
}

function xpProgress(xp, level) {
  const current = LEVEL_XP[level] || 0;
  const next = LEVEL_XP[level + 1] || LEVEL_XP[6];
  if (!next || next <= current) return 100;
  return Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
}

function xpToNextLevel(xp, level) {
  const next = LEVEL_XP[level + 1];
  if (!next) return null;
  return Math.max(0, next - xp);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActiveMissionsCard({ activeGoals }) {
  if (!activeGoals?.goals?.length) return null;

  const goals     = activeGoals.goals;
  const pending   = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);
  if (pending.length === 0 && completed.length === 0) return null;

  return (
    <motion.div
      className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.03] px-5 py-4 mb-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-orange-400/70" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-orange-400/60 font-semibold">Active Training Goals</div>
            <div className="text-[11px] text-white/35 mt-0.5">
              {LEVEL_NAMES[activeGoals.level] || `Level ${activeGoals.level}`} · target {activeGoals.target_score}+ per dimension
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black">
            {completed.length}<span className="text-white/25">/{goals.length}</span>
          </span>
          <Link to="/setup" className="text-xs text-orange-400/60 hover:text-orange-400 transition-colors font-semibold">
            Train →
          </Link>
        </div>
      </div>

      <div className="h-0.5 bg-white/5 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500/50 transition-all duration-700"
          style={{ width: `${goals.length ? (completed.length / goals.length) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-2">
        {goals.map((g, i) => (
          <div key={i} className={cn('flex items-center gap-2.5', g.completed && 'opacity-40')}>
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border',
              g.completed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30',
            )}>
              {g.completed ? '✓' : '→'}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn('text-xs font-semibold truncate', g.completed ? 'text-emerald-400/70 line-through' : 'text-white/65')}>
                {g.title}
              </div>
              <div className="text-[10px] text-white/30">{SCORE_LABELS[g.dimension] || g.dimension}</div>
            </div>
            <span className="text-[10px] text-white/20 flex-shrink-0">+75 XP</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FounderProfileCard({ user }) {
  const { xp = 0, level = 1, badges = [] } = user;
  const pct = xpProgress(xp, level);
  const toNext = xpToNextLevel(xp, level);
  const levelName = LEVEL_NAMES[level] || `Level ${level}`;

  if (xp === 0 && badges.length === 0) return null;

  return (
    <motion.div
      className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-5 mb-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/30 uppercase tracking-widest">Founder Level</span>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
              Lv.{level}
            </span>
          </div>
          <div className="text-base font-bold text-white/85 mb-3">{levelName}</div>

          {/* XP bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <span className="text-xs text-white/30 tabular-nums shrink-0">{xp} XP</span>
          </div>
          {toNext !== null && (
            <p className="text-[11px] text-white/25 mt-1">{toNext} XP to {LEVEL_NAMES[level + 1]}</p>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:max-w-[220px]">
            {badges.map((b) => {
              const bc = BADGE_CONFIG[b];
              if (!bc) return null;
              return (
                <span
                  key={b}
                  title={bc.label}
                  className="text-base cursor-default select-none rounded-lg bg-white/5 border border-white/8 p-1.5 hover:bg-white/10 transition-colors"
                >
                  {bc.icon}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatsTiles({ stats }) {
  if (!stats) return null;
  const scoreColor = stats.avg >= 70 ? 'text-emerald-400' : stats.avg >= 45 ? 'text-orange-400' : 'text-red-400';
  const bestColor = stats.best >= 70 ? 'text-emerald-400' : stats.best >= 45 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Sessions', value: stats.total, icon: Layers, color: 'text-white/60' },
        { label: 'Avg Score', value: stats.avg, icon: null, color: scoreColor },
        { label: 'Best Score', value: stats.best, icon: Award, color: bestColor },
        { label: 'Top Mode', value: MODE_CONFIG[stats.topMode]?.label || '—', icon: null, color: 'text-white/60' },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            {Icon && <Icon size={11} className="text-white/25" />}
            <span className="text-[10px] text-white/30 uppercase tracking-widest">{label}</span>
          </div>
          <div className={cn('text-xl font-black', color)}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function MiniBarChart({ scores }) {
  if (!scores) return null;
  return (
    <div className="hidden sm:flex items-end gap-0.5 h-6 shrink-0">
      {Object.keys(SCORE_LABELS_SHORT).map((key) => {
        const val = scores[key] ?? 0;
        const barH = Math.max(3, Math.round((val / 100) * 24));
        const col = val >= 70 ? 'bg-emerald-500' : val >= 45 ? 'bg-orange-500' : 'bg-red-500';
        return (
          <div key={key} className="w-1.5 bg-white/5 rounded-sm flex items-end" style={{ height: '24px' }}>
            <div className={cn('w-full rounded-sm opacity-70', col)} style={{ height: `${barH}px` }} />
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    Promise.all([api.me(), api.getSessions()])
      .then(([u, s]) => { setUser(u); setSessions(s); })
      .catch((e) => {
        if (e.message.includes('401') || e.message.toLowerCase().includes('not authenticated')) {
          navigate('/login');
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pitchroom_session_meta');
    navigate('/');
  };

  const stats = sessions.length ? computeStats(sessions) : null;

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-2.5">
          <Rocket className="text-orange-500" size={20} />
          <span className="font-bold tracking-tight">PitchRoom AI</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/40">Hi, {user.name.split(' ')[0]}</span>
              {(user.level || 1) > 1 && (
                <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                  Lv.{user.level} · {LEVEL_NAMES[user.level]}
                </span>
              )}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Sessions</h1>
            <p className="text-white/40 text-sm mt-1">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link to="/setup">
            <Button><Plus size={16} /> New Pitch Session</Button>
          </Link>
        </div>

        {/* Founder Profile (hidden until user has XP or badges) */}
        {user && <FounderProfileCard user={user} />}

        {/* Active training goals from DB */}
        <ActiveMissionsCard activeGoals={user?.active_goals} />

        {/* Stats Tiles */}
        <StatsTiles stats={stats} />

        {loading ? (
          <div className="flex items-center justify-center h-48 text-white/30">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading sessions...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-red-400 text-center">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Rocket size={28} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No sessions yet</h2>
            <p className="text-white/40 text-sm mb-6">Start your first pitch simulation to see results here.</p>
            <Link to="/setup"><Button>Start Your First Pitch</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s, i) => {
              const m = MODE_CONFIG[s.mode] || MODE_CONFIG.vc;
              const score = getSessionScore(s);
              const isEnded = !!s.ended_at;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="hover:border-white/15 transition-all duration-200 cursor-pointer group"
                    onClick={() => isEnded && navigate(`/results/${s.id}`)}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      {/* Mode icon */}
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                        {m.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">{s.startup_name || 'Unnamed Startup'}</span>
                          <Badge variant="secondary" className="shrink-0 text-[10px]">{m.label}</Badge>
                          {isEnded
                            ? <Badge variant="success" className="shrink-0 text-[10px]">Complete</Badge>
                            : <Badge variant="secondary" className="shrink-0 text-[10px]">In progress</Badge>
                          }
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/35">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>{s.transcript?.length || 0} messages</span>
                        </div>
                      </div>

                      {/* Mini dimension bar chart */}
                      <MiniBarChart scores={s.final_report?.scores} />

                      {/* Overall score */}
                      {score != null && (
                        <div className="shrink-0 text-right">
                          <div className={cn(
                            'text-xl font-black',
                            score >= 70 ? 'text-emerald-400' : score >= 45 ? 'text-orange-400' : 'text-red-400'
                          )}>
                            {score}
                          </div>
                          <div className="text-xs text-white/30">/ 100</div>
                        </div>
                      )}

                      {isEnded && (
                        <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Mic, Shield, BarChart3, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Shield,
    title: 'Adversarial AI',
    desc: 'Battle-test your pitch against VCs trained to challenge every claim you make.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Scoring',
    desc: 'Eight investment dimensions evaluated live as you speak.',
  },
  {
    icon: Mic,
    title: 'Voice-First',
    desc: 'Practice exactly how you\'ll pitch — by talking, not typing.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <Rocket className="text-orange-500" size={22} />
          <span className="text-lg font-bold tracking-tight">PitchRoom AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started <ArrowRight size={14} /></Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge className="mb-6 px-3 py-1 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse mr-1.5" />
            AI SIMULATION ACTIVE
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 max-w-4xl">
            Pitch to an AI&nbsp;VC<br />
            <span className="text-orange-500">before the real one.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mb-10 mx-auto leading-relaxed">
            Practice your investor pitch with an AI that pushes back, scores in real time,
            and helps you find the holes before your actual meeting.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="text-base px-8">
                Start Pitching Free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Sign in
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 w-full max-w-3xl rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-white/3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-white/30 font-mono">pitchroom.ai — live session</span>
            <Badge variant="destructive" className="ml-auto">LIVE 02:34</Badge>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-white/6">
            <div className="p-5 space-y-3">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Live Transcript</p>
              {[
                { speaker: 'You', text: "We're building an AI-powered supply chain tool for mid-market manufacturers.", side: 'right' },
                { speaker: 'Sarah V.', text: "What's your differentiation from incumbents like SAP? Everyone claims AI.", side: 'left' },
                { speaker: 'You', text: "Our model is fine-tuned on 5 years of proprietary factory floor data.", side: 'right' },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.side === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.side === 'right' ? 'bg-orange-500/20 text-white' : 'bg-white/6 text-white/70'}`}>
                    <span className="font-semibold">{m.speaker}: </span>{m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Live Intelligence</p>
              {[
                { label: 'Problem Clarity', val: 82 },
                { label: 'Value Proposition', val: 68 },
                { label: 'Market Size', val: 45 },
                { label: 'Defensibility', val: 71 },
              ].map((s) => (
                <div key={s.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">{s.label}</span>
                    <span className="text-orange-400 font-semibold">{s.val}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${s.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-xl border border-white/8 bg-white/3 p-6 group hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center mb-4 group-hover:bg-orange-500/25 transition-colors">
                <f.icon size={20} className="text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 text-center text-xs text-white/25">
        <div className="flex items-center justify-center gap-2">
          <Rocket size={14} className="text-orange-500" />
          <span>PitchRoom AI — practice makes founders</span>
        </div>
      </footer>
    </div>
  );
}

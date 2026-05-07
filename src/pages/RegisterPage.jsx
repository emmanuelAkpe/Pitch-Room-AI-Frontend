import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.register({ name: form.name, email: form.email, password: form.password });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-8 py-5">
        <Link to="/" className="flex items-center gap-2 text-white no-underline w-fit">
          <Rocket className="text-orange-500" size={20} />
          <span className="font-bold tracking-tight">PitchRoom AI</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1.5">Create account</h1>
              <p className="text-sm text-white/40">Start pitching in under a minute</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Full Name</label>
                <Input placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Email</label>
                <Input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Password</label>
                <Input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">Confirm Password</label>
                <Input type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/40">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

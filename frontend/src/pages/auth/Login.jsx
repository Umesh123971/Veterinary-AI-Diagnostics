import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Microscope, Lock, Mail, ShieldCheck, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Login = () => {
  const { login, switchRole } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@vetai.demo');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);

      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'technician') navigate('/technician');
        else navigate('/doctor');
      } else {
        setError(res.message);
      }
    }, 600);
  };

  const handleQuickDemoUser = (demoEmail, role) => {
    setEmail(demoEmail);
    setPassword('demo123');
    switchRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[620px]">
        
        {/* Left Side: Branding & Microscopic Visual */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/60 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Microscope className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Vet<span className="text-teal-400">AI</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Veterinary AI Diagnostics</p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold rounded-full">
                Multi-Modal Deep Learning Research Framework
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
                AI-Assisted Veterinary Diagnostic Decision Support
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Multi-modal analysis of microscopic blood smear images and hematological data for canine vector-borne disease screening.
              </p>
            </div>
          </div>

          {/* Disease Modules Callout Graphic */}
          <div className="relative z-10 mt-8 pt-8 border-t border-slate-800/80">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Target Vector-Borne Pathogens</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Canine Ehrlichiosis</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Canine Babesiosis</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Canine Dirofilariasis</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Canine Hepatozoonosis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form & Demo User Selectors */}
        <div className="lg:col-span-6 bg-slate-900 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white">System Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">Sign in to access your clinical portal</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@vetai.demo"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-teal-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo environment: Use default demo user buttons below.'); }} className="text-teal-400 hover:underline">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>
            </form>
          </div>

          {/* Quick Role Demo Selector Buttons (Step 5 requirement) */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Demo Persona (Quick Test Login):
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('admin@vetai.demo', 'admin')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === 'admin@vetai.demo'
                    ? 'bg-teal-950/80 border-teal-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@vetai.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoUser('technician@vetai.demo', 'technician')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === 'technician@vetai.demo'
                    ? 'bg-teal-950/80 border-teal-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">Lab Tech</div>
                <div className="text-[10px] text-slate-400 truncate">technician@vetai.demo</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoUser('doctor@vetai.demo', 'doctor')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === 'doctor@vetai.demo'
                    ? 'bg-teal-950/80 border-teal-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold">Doctor</div>
                <div className="text-[10px] text-slate-400 truncate">doctor@vetai.demo</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

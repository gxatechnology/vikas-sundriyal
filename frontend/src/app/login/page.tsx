'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import { KeyRound, Mail, Ship, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, token } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
     const response = await api.post('/auth/login', {
  email,
  password,
});

      const { user, accessToken } = response.data;
      login(user, accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to sign in. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUser = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6 relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
            <Ship size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome to GXA Technologies
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Access the GXA Technologies Logistics ERP
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none text-sm transition-all"
              />
              <KeyRound className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Accounts Board */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-3 text-center">
            Quick-click GXA Tech Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => loadDemoUser('vikas@gxatechnologies.com', 'admin123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 truncate"
            >
              Vikas Sundriyal
            </button>
            <button
              onClick={() => loadDemoUser('operations@gxatechnologies.com', 'employee123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 truncate"
            >
              GXA Tech
            </button>
            <button
              onClick={() => loadDemoUser('accounts@gxatechnologies.com', 'employee123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 truncate"
            >
              Tauqeer Ashraf (Accounts)
            </button>
            <button
              onClick={() => loadDemoUser('client@gxatechnologies.com', 'customer123')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 truncate"
            >
              Test Vikas (Client)
            </button>
          </div>
        </div>

        {/* Back Link to Tracking */}
        <div className="mt-6 text-center text-xs">
          <span className="text-slate-500">Need to track a cargo? </span>
          <button
            onClick={() => router.push('/tracking')}
            className="text-blue-500 hover:underline"
          >
            Track Shipment Number
          </button>
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ADMIN_USER } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  moderators: User[];
  logoUrl?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, moderators, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      const allUsers = [ADMIN_USER, ...moderators];
      const user = allUsers.find(u => u.email === email);

      if (user && password === 'password') {
        onLogin(user);
      } else {
        setError('Invalid credentials. Hint: password is "password".');
        setIsLoading(false);
      }
    }, 800);
  };

  const quickLogin = (type: 'admin' | 'moderator') => {
    setEmail(type === 'admin' ? ADMIN_USER.email : (moderators[0]?.email || 'rahim@wellhealth.com'));
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-orange-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-950 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-3xl backdrop-blur-md mb-6 border border-white/10 shadow-xl p-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Baburchi" className="w-full h-full object-contain" />
              ) : (
                <span className="text-3xl font-black text-orange-500">BB</span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Baburchi</h1>
            <p className="mt-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Portal Access Control</p>
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-slate-700"
                    placeholder="admin@baburchi.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-rose-600 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {isLoading ? 'Authenticating...' : 'Log In to Dashboard'}
            </button>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => quickLogin('admin')}
                className="px-4 py-3 text-[10px] font-black text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('moderator')}
                className="px-4 py-3 text-[10px] font-black text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Moderator
              </button>
            </div>
          </form>

          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              © 2025 Baburchi Enterprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

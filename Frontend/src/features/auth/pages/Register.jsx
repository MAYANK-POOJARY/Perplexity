import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';
import { Eye, EyeOff, ArrowRight, Sun, Moon, Loader2 } from 'lucide-react';
import AxiomLogo from '../../chat/components/header/AxiomLogo';
import { useTheme } from '../../../lib/theme';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const authError = useSelector((state) => state.auth.error);

  const submitForm = async (e) => {
    e.preventDefault();
    await handleRegister({ username, email, password });
    navigate('/login');
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f8fafc] text-zinc-900 dark:bg-[#0b0d13] dark:text-zinc-100 transition-colors duration-200 overflow-hidden selection:bg-indigo-500/25">
      {/* Ambient background glow spheres */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all cursor-pointer shadow-xs"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>

      {/* Main Centered Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-[#12141f]/80 p-8 sm:p-10 shadow-xl shadow-zinc-900/5 dark:shadow-black/50 backdrop-blur-xl animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <AxiomLogo className="w-10 h-10" isIconOnly />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Create your Axiom account
          </h1>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            Join the research workspace for synthesis and inquiry.
          </p>
        </div>

        {/* Register Form */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 text-center font-medium">
            {authError}
          </div>
        )}

        <form onSubmit={submitForm} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 px-3.5 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 focus:ring-3 focus:ring-indigo-500/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm py-2.5 px-4 shadow-md shadow-indigo-500/20 active:scale-[0.985] transition-all duration-150 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

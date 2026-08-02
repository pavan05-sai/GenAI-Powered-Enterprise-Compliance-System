import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-4 font-sans select-none">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center">
        <h1 className="font-serif text-3xl font-bold tracking-widest text-[#1A1918]">VERITAS</h1>
        <span className="text-[11px] uppercase tracking-widest text-[#8C6B1B] font-semibold mt-1">Enterprise Compliance AI</span>
      </div>

      {/* Main Login Card matching visual reference */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E6E2D8] p-8 shadow-sm transition-all duration-200">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1A1918]">Sign in</h2>
          <p className="text-xs text-[#6E6B62] mt-1">Access your workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg text-xs text-[#D32F2F]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E6B62] mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#1A1918] transition-all placeholder-[#A09C90]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6B62]">
                PASSWORD
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#8C6B1B] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 pr-10 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#1A1918] transition-all placeholder-[#A09C90]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877A] hover:text-[#1A1918]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="keep-signed-in"
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#E6E2D8] text-[#8C6B1B] focus:ring-[#C59B27]"
            />
            <label htmlFor="keep-signed-in" className="ml-2 text-xs text-[#6E6B62]">
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#1A1918] hover:bg-[#33312E] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#6E6B62]">
          No account?{' '}
          <Link to="/register" className="text-[#8C6B1B] font-semibold hover:underline">
            Create one
          </Link>
        </div>
      </div>

      {/* Footer Security Badge */}
      <div className="mt-8 flex items-center gap-1.5 text-[11px] text-[#8C877A]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
        <span>256-bit encryption • SOC 2 certified</span>
      </div>
    </div>
  );
}

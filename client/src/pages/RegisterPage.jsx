import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Compliance Officer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(name, email, password, role);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="mb-6 flex flex-col items-center">
        <h1 className="font-serif text-3xl font-bold tracking-widest text-[#1A1918]">VERITAS</h1>
        <span className="text-[11px] uppercase tracking-widest text-[#8C6B1B] font-semibold mt-1">Enterprise Compliance AI</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E6E2D8] p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1A1918]">Create Account</h2>
          <p className="text-xs text-[#6E6B62] mt-1">Set up your compliance workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg text-xs text-[#D32F2F]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E6B62] mb-1.5">FULL NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#1A1918] transition-all placeholder-[#A09C90]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E6B62] mb-1.5">WORK EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#1A1918] transition-all placeholder-[#A09C90]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E6B62] mb-1.5">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#1A1918] transition-all placeholder-[#A09C90]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E6B62] mb-1.5">ROLE</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-lg focus:outline-none focus:border-[#C59B27] text-[#1A1918]"
            >
              <option value="Compliance Officer">Compliance Officer</option>
              <option value="Security Lead">Security Lead</option>
              <option value="Data Auditor">Data Auditor</option>
              <option value="Legal Counsel">Legal Counsel</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#1A1918] hover:bg-[#33312E] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 mt-2"
          >
            {isSubmitting ? 'Creating account...' : 'Create Workspace Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#6E6B62]">
          Already registered?{' '}
          <Link to="/login" className="text-[#8C6B1B] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-1.5 text-[11px] text-[#8C877A]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
        <span>256-bit encryption • SOC 2 certified</span>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Mock success with short latency
        await new Promise((r) => setTimeout(r, 800));
      }
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('meetingmind_user_profile');
        if (!stored) {
          const namePart = email.split('@')[0];
          const guessedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          localStorage.setItem('meetingmind_user_profile', JSON.stringify({
            name: guessedName || 'Alex Harrison',
            role: 'VC Partner & Investor',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          }));
        }
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#f3f3f3] text-[#1d1d1f] flex flex-col justify-center items-center p-6 font-sans select-none">
      
      {/* Brand logo header */}
      <Link href="/" className="flex items-center gap-3 mb-10 group">
        <div className="p-2.5 bg-black text-white rounded-custom-sm shadow-md transition-transform duration-300 group-hover:scale-105">
          <BrainCircuit size={24} />
        </div>
        <span className="text-[22px] font-bold tracking-tight">MeetingMind</span>
      </Link>

      <GlassCard hoverable={false} className="w-full max-w-[460px] p-10 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-[26px] font-extrabold text-text-main tracking-tight leading-tight">Welcome Back</h2>
          <p className="text-[13px] font-semibold text-text-sub">Sign in to review relationship memories.</p>
        </div>

        {errorMsg && (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-[13px] font-bold p-4 rounded-custom-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email field */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={12} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="
                w-full 
                px-5 
                py-4 
                bg-white/60 
                border 
                border-white/40 
                rounded-custom-sm 
                text-[15px] 
                text-text-main
                placeholder-text-sub
                focus:outline-none 
                focus:border-black/20 
                transition-all
              "
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={12} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="
                w-full 
                px-5 
                py-4 
                bg-white/60 
                border 
                border-white/40 
                rounded-custom-sm 
                text-[15px] 
                text-text-main
                placeholder-text-sub
                focus:outline-none 
                focus:border-black/20 
                transition-all
              "
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="
              flex 
              items-center 
              justify-center 
              gap-2.5 
              w-full 
              py-4.5 
              bg-black 
              text-white 
              font-bold 
              text-[14px] 
              rounded-custom-sm 
              shadow-md 
              hover:bg-black/95 
              disabled:opacity-50 
              transition-all 
              duration-300 
              mt-2
            "
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Info label about Mock mode */}
        {!isSupabaseConfigured && (
          <div className="flex items-center gap-2 text-accent-blue bg-accent-blue/10 border border-accent-blue/20 p-4 rounded-custom-sm text-[12px] font-semibold">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Developer Mock Mode Active. Use any email/pass.</span>
          </div>
        )}

        <div className="text-center text-[13px] text-text-sub mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-black hover:underline">
            Sign Up
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function Signup() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              company: company,
            },
          },
        });
        if (error) throw error;
        alert("Registration successful! Please check your email for the confirmation link.");
      } else {
        // Mock success with short latency
        await new Promise((r) => setTimeout(r, 1000));
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('meetingmind_user_profile', JSON.stringify({
          name: name || 'Alex Harrison',
          role: `Builder at ${company || 'Seed Capital'}`,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        }));
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Signup failed. Please try again.');
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

      <GlassCard hoverable={false} className="w-full max-w-[480px] p-10 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-[26px] font-extrabold text-text-main tracking-tight leading-tight">Create Account</h2>
          <p className="text-[13px] font-semibold text-text-sub">Get started with relationship intelligence.</p>
        </div>

        {errorMsg && (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-[13px] font-bold p-4 rounded-custom-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          
          {/* Full Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Harrison"
              required
              className="
                w-full 
                px-5 
                py-3.5 
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

          {/* Company field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={12} />
              Company / Fund
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Seed Capital"
              required
              className="
                w-full 
                px-5 
                py-3.5 
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

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
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
                py-3.5 
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={12} />
              Choose Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="
                w-full 
                px-5 
                py-3.5 
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
              mt-4
            "
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Info label about Mock mode */}
        {!isSupabaseConfigured && (
          <div className="flex items-center gap-2 text-accent-blue bg-accent-blue/10 border border-accent-blue/20 p-4 rounded-custom-sm text-[12px] font-semibold">
            <ShieldCheck size={16} className="shrink-0" />
            <span>Developer Mock Mode Active. No credentials required.</span>
          </div>
        )}

        <div className="text-center text-[13px] text-text-sub mt-2">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-black hover:underline">
            Sign In
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

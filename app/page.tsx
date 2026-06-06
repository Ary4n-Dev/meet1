"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, Shield, HeartHandshake, ArrowRight, Play, Eye, Users, ChevronRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function LandingPage() {
  const [sandboxNotes, setSandboxNotes] = useState(
    "Met with Rahul Sharma from HealthTech. He mentioned they prefer Slack for communication and are deeply worried about compliance certifications for their upcoming medical database audit in September. We promised to share our compliance guide by this Friday."
  );
  const [demoStatus, setDemoStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [extractedMemories, setExtractedMemories] = useState<any[]>([]);

  const handleDemoExtract = async () => {
    setDemoStatus('analyzing');
    await new Promise((r) => setTimeout(r, 1500)); // Simulate AI wait
    setExtractedMemories([
      { type: 'preference', content: "Prefers Slack for communication.", confidence: 0.95 },
      { type: 'concern', content: "Worried about compliance audits in Sept.", confidence: 0.88 },
      { type: 'promise', content: "Deliver compliance guide by Friday.", confidence: 0.92 },
    ]);
    setDemoStatus('done');
  };

  const resetDemo = () => {
    setExtractedMemories([]);
    setDemoStatus('idle');
  };

  const getTagColor = (type: string) => {
    if (type === 'concern') return 'text-accent-orange bg-accent-orange/10 border-accent-orange/10';
    if (type === 'promise') return 'text-accent-green bg-accent-green/10 border-accent-green/10';
    return 'text-accent-blue bg-accent-blue/10 border-accent-blue/10';
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] text-[#1d1d1f] flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-8 py-8 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2.5 bg-black text-white rounded-custom-sm shadow-md">
            <BrainCircuit size={24} />
          </div>
          <span className="text-[20px] font-bold tracking-tight">MeetingMind</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2.5 text-[14px] font-bold text-text-sub hover:text-black transition-colors duration-300">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="
              px-6 
              py-2.5 
              bg-black 
              text-white 
              rounded-full 
              text-[14px] 
              font-bold 
              shadow-sm 
              hover:bg-black/90 
              transition-all 
              duration-300
            "
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-8 pt-20 pb-16 flex flex-col items-center text-center gap-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-2 bg-black/5 border border-black/5 px-4 py-1.5 rounded-full mb-2">
            <Sparkles size={14} className="text-black" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Now Integrated with Hindsight SDK</span>
          </div>

          <h1 className="text-[48px] md:text-[84px] font-extrabold tracking-tight leading-[1.05] max-w-4xl text-text-main">
            Every Conversation.<br />Remembered.
          </h1>
          
          <p className="text-[18px] md:text-[22px] font-medium text-text-sub max-w-2xl leading-relaxed mt-2">
            MeetingMind transforms meeting notes into long-term relationship memory. Never forget client concerns, promises, or working preferences again.
          </p>
        </motion.div>

        {/* Hero CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mt-4"
        >
          <Link
            href="/signup"
            className="
              flex 
              items-center 
              gap-2 
              px-8 
              py-4.5 
              bg-black 
              text-white 
              rounded-full 
              text-[15px] 
              font-bold 
              shadow-md 
              hover:bg-black/95 
              hover:translate-y-[-2px] 
              transition-all 
              duration-300
            "
          >
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>

          <a
            href="#demo"
            className="
              flex 
              items-center 
              gap-2 
              px-8 
              py-4.5 
              bg-white/80 
              border 
              border-black/5 
              text-black 
              rounded-full 
              text-[15px] 
              font-bold 
              shadow-sm 
              hover:bg-white 
              hover:translate-y-[-2px] 
              transition-all 
              duration-300
            "
          >
            <Play size={16} fill="black" />
            <span>Try Live Sandbox</span>
          </a>
        </motion.div>
      </section>

      {/* Product Demo (Memory Sandbox) */}
      <section id="demo" className="w-full max-w-6xl mx-auto px-8 py-20 z-10 scroll-mt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6 items-center text-center mb-12"
        >
          <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-tight text-text-main">
            Watch Memory Extraction in Action
          </h2>
          <p className="text-[16px] text-text-sub max-w-xl">
            Type out conversation notes or meeting transcriptions in the sandbox below to see our custom memory extraction layer work.
          </p>
        </motion.div>

        {/* Sandbox Console */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Note Input */}
          <GlassCard hoverable={false} className="p-8 flex flex-col gap-5 justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider">Meeting Transcript Sandbox</span>
              <textarea
                value={sandboxNotes}
                onChange={(e) => setSandboxNotes(e.target.value)}
                rows={7}
                className="
                  w-full 
                  p-5 
                  bg-white/50 
                  border 
                  border-white/30 
                  rounded-custom-sm 
                  text-[14px] 
                  text-text-main 
                  leading-relaxed 
                  focus:outline-none 
                  focus:border-black/20 
                  resize-none
                "
              />
            </div>

            {demoStatus === 'idle' ? (
              <button
                onClick={handleDemoExtract}
                className="
                  w-full 
                  py-4 
                  bg-black 
                  text-white 
                  font-bold 
                  text-[14px] 
                  rounded-custom-sm 
                  shadow-md 
                  hover:bg-black/90 
                  transition-all 
                  duration-300
                "
              >
                Trigger Memory Extraction
              </button>
            ) : (
              <button
                onClick={resetDemo}
                className="
                  w-full 
                  py-4 
                  bg-white 
                  text-black 
                  border 
                  border-black/5 
                  font-bold 
                  text-[14px] 
                  rounded-custom-sm 
                  shadow-sm 
                  hover:bg-black/5 
                  transition-all 
                  duration-300
                "
              >
                Clear Sandbox
              </button>
            )}
          </GlassCard>

          {/* AI Output Console */}
          <GlassCard hoverable={false} className="p-8 flex flex-col justify-between border-dashed border-black/10">
            <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider mb-3 block">Hindsight Memory Staged Items</span>
            
            <div className="flex-1 flex flex-col gap-3.5 justify-center">
              <AnimatePresence mode="wait">
                {demoStatus === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center p-6 text-text-sub"
                  >
                    <Sparkles size={32} className="text-black/5 mb-3" />
                    <p className="text-[13px] font-semibold">Ready to process transcript</p>
                  </motion.div>
                )}

                {demoStatus === 'analyzing' && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 items-center justify-center text-center p-6 text-text-sub"
                  >
                    <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin mb-2" />
                    <p className="text-[13px] font-semibold">Extracting concerns, promises, & preferences...</p>
                  </motion.div>
                )}

                {demoStatus === 'done' && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    {extractedMemories.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-white/80 rounded-custom-sm border border-black/5 flex items-start gap-4"
                      >
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 border mt-0.5 ${getTagColor(m.type)}`}>
                          {m.type}
                        </span>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-text-main leading-snug">{m.content}</p>
                          <p className="text-[10px] font-bold text-text-sub mt-1 uppercase tracking-wide">{Math.round(m.confidence * 100)}% Confidence Match</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {demoStatus === 'done' && (
              <Link
                href="/signup"
                className="
                  flex 
                  items-center 
                  justify-center 
                  gap-2 
                  w-full 
                  py-4 
                  bg-accent-green 
                  text-white 
                  font-extrabold 
                  text-[14px] 
                  rounded-custom-sm 
                  shadow-md 
                  hover:bg-accent-green/95 
                  transition-all 
                  duration-300 
                  mt-5
                "
              >
                <span>Commit to Persistent Memory</span>
                <ChevronRight size={16} />
              </Link>
            )}
          </GlassCard>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-8 py-20 z-10 border-t border-black/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col gap-4 p-4">
            <div className="p-3 bg-white border border-black/5 rounded-custom-sm w-fit shadow-sm text-text-main">
              <BrainCircuit size={24} />
            </div>
            <h4 className="text-[18px] font-bold text-text-main">Cognitive Hindsight Layers</h4>
            <p className="text-[14px] text-text-sub leading-relaxed">
              We structure details based on observation type, semantic alignment, and decay weight rather than just performing basic keyword matching.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <div className="p-3 bg-white border border-black/5 rounded-custom-sm w-fit shadow-sm text-text-main">
              <Shield size={24} />
            </div>
            <h4 className="text-[18px] font-bold text-text-main">Absolute Data Security</h4>
            <p className="text-[14px] text-text-sub leading-relaxed">
              Relationship data is locked behind secure client filters, ensuring your meeting notes stay confidential and compliant.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <div className="p-3 bg-white border border-black/5 rounded-custom-sm w-fit shadow-sm text-text-main">
              <HeartHandshake size={24} />
            </div>
            <h4 className="text-[18px] font-bold text-text-main">Readiness & Risk Gauges</h4>
            <p className="text-[14px] text-text-sub leading-relaxed">
              Identify friction hotspots or upcoming deadlines automatically before key stakeholder sessions occur.
            </p>
          </div>

        </div>
      </section>

      {/* How Memory Works section */}
      <section className="w-full bg-black text-white py-24 select-none">
        <div className="max-w-6xl mx-auto px-8 flex flex-col gap-16">
          <div className="flex flex-col gap-4 items-center text-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/50">Core Engineering workflow</span>
            <h2 className="text-[32px] md:text-[48px] font-extrabold tracking-tight">The Hindsight Core Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-[44px] font-extrabold leading-none text-white/10">01</span>
              <h4 className="text-[16px] font-bold">Notes Submission</h4>
              <p className="text-[13px] text-white/60 leading-relaxed">Submit raw audio transcripts, files, or typed notes to the sandbox workspace.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[44px] font-extrabold leading-none text-white/10">02</span>
              <h4 className="text-[16px] font-bold">AI Extraction</h4>
              <p className="text-[13px] text-white/60 leading-relaxed">Gemini parses statements, matching them to concerns, preferences, and promises.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[44px] font-extrabold leading-none text-white/10">03</span>
              <h4 className="text-[16px] font-bold">Temporal Recall</h4>
              <p className="text-[13px] text-white/60 leading-relaxed">The Hindsight layer weighs facts dynamically based on memory age and confidence indexes.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[44px] font-extrabold leading-none text-white/10">04</span>
              <h4 className="text-[16px] font-bold">Prep Briefing</h4>
              <p className="text-[13px] text-white/60 leading-relaxed">Generate talking point outlines, risk maps, and checklists to guarantee success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-6xl mx-auto px-8 py-24 z-10">
        <div className="flex flex-col gap-12 text-center items-center">
          <h2 className="text-[32px] md:text-[40px] font-extrabold tracking-tight text-text-main">
            Endorsed by Top-Tier Founders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <GlassCard hoverable={false} className="p-8 text-left flex flex-col justify-between gap-6">
              <p className="text-[15px] font-medium text-text-sub italic leading-relaxed">
                "Before MeetingMind, I was constantly scrolling through old email threads trying to remember client request specifics before contract syncs. Now, I have a complete memory prep briefing compiled automatically. It feels like magic."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Founder Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="text-[13px] font-bold text-text-main">Marcus Vance</h5>
                  <p className="text-[11px] font-semibold text-text-sub">CEO, HyperLog</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard hoverable={false} className="p-8 text-left flex flex-col justify-between gap-6">
              <p className="text-[15px] font-medium text-text-sub italic leading-relaxed">
                "The Hindsight Memory integration is what makes this app stand out. Rather than generic note taking, it builds a localized profile that updates with temporal decay. Extremely helpful tool."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="Founder Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="text-[13px] font-bold text-text-main">Elena Rostova</h5>
                  <p className="text-[11px] font-semibold text-text-sub">Co-Founder, Synthetix</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="w-full bg-[#e6e6e6] py-20 text-center select-none mt-auto border-t border-black/5">
        <div className="max-w-4xl mx-auto px-8 flex flex-col items-center gap-6">
          <h3 className="text-[32px] md:text-[44px] font-extrabold text-text-main tracking-tight leading-tight">
            Ready to Upgrade Your Relationship Intelligence?
          </h3>
          <p className="text-[15px] font-semibold text-text-sub max-w-lg leading-relaxed">
            Create an account today and start tracking client promises with persistent memory.
          </p>
          <Link
            href="/signup"
            className="
              px-8 
              py-4.5 
              bg-black 
              text-white 
              font-bold 
              text-[15px] 
              rounded-full 
              shadow-md 
              hover:bg-black/90 
              transition-all 
              duration-300 
              mt-4
            "
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

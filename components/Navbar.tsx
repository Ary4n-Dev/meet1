"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Brain, Sparkles, Bell } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // Simple route name mapper
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Relationship Dashboard';
    if (pathname.startsWith('/people/new')) return 'Add New Contact';
    if (pathname.startsWith('/people/')) return 'Relationship Dossier';
    if (pathname.startsWith('/people')) return 'Contacts Directory';
    if (pathname.startsWith('/meetings/new')) return 'Log New Meeting';
    if (pathname.startsWith('/meetings')) return 'Meetings Directory';
    if (pathname.startsWith('/briefing/')) return 'AI Meeting Briefing';
    return 'MeetingMind';
  };

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <header
      className="
        h-24 
        px-10 
        flex 
        items-center 
        justify-between 
        glass-panel 
        rounded-custom-md 
        m-4 
        ml-0 
        shadow-premium-soft 
        border 
        border-white/40
      "
    >
      <div className="flex items-center gap-4">
        <h1 className="text-[20px] font-bold text-text-main tracking-tight">{getPageTitle()}</h1>
        <div className="hidden md:flex items-center gap-2 bg-accent-blue/5 border border-accent-blue/15 px-3 py-1 rounded-full">
          <Sparkles size={12} className="text-accent-blue animate-pulse" />
          <span className="text-[11px] font-semibold text-accent-blue tracking-wide uppercase">Memory System Active</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Memory status summary indicator */}
        <div className="flex items-center gap-3 text-text-sub hover:text-text-main cursor-pointer transition-colors duration-300">
          <Brain size={18} />
          <span className="text-[13px] font-semibold">98.4% Recall Index</span>
        </div>

        {/* Notifications mock button */}
        <button className="p-3 text-text-sub hover:text-text-main hover:bg-black/5 rounded-full transition-all duration-300 relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-orange rounded-full" />
        </button>
      </div>
    </header>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { isSupabaseConfigured, supabase, clearMockDatabase } from '@/lib/supabase';
import { SkeletonBlock } from '@/components/LoadingStates';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initWorkspace() {
      // One-time cleanup of pre-existing fake data to ensure a clean slate for the user
      if (typeof window !== 'undefined') {
        const hasCleaned = localStorage.getItem('meetingmind_cleaned_fake_data');
        if (!hasCleaned) {
          clearMockDatabase();
          localStorage.setItem('meetingmind_cleaned_fake_data', 'true');
        }
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            console.log("No active user session found, redirecting to login...");
            router.push('/login');
            return;
          }
        } catch (err) {
          console.error("Workspace auth validation failed:", err);
          router.push('/login');
          return;
        }
      }
      setIsReady(true);
    }
    initWorkspace();
  }, [router]);

  if (!isReady) {
    return (
      <div className="w-screen h-screen flex bg-[#f3f3f3] p-10 items-center justify-center gap-10">
        <SkeletonBlock className="w-80 h-full rounded-custom-xl" />
        <div className="flex-1 h-full flex flex-col gap-6">
          <SkeletonBlock className="h-24 w-full rounded-custom-md" />
          <SkeletonBlock className="flex-1 w-full rounded-custom-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-[#f3f3f3]">
      {/* Lateral navigation */}
      <Sidebar />

      {/* Main content body */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-10 pb-12 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}

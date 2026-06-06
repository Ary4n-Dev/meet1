"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft, Printer, Share2, BrainCircuit } from 'lucide-react';
import BriefingCard from '@/components/BriefingCard';
import { getPersonById, getBriefing } from '@/lib/supabase';
import { generateMeetingBriefing } from '@/lib/gemini';
import { Person, Briefing } from '@/lib/types';
import { SkeletonBlock } from '@/components/LoadingStates';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingBriefing({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams ? searchParams.get('topic') || '' : '';
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<Person | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    async function loadBriefing() {
      try {
        const pData = await getPersonById(id);
        if (!pData) {
          router.push('/people');
          return;
        }
        setPerson(pData);

        let briefData;
        if (topic) {
          // If a custom topic is requested, trigger a fresh compilation
          briefData = await generateMeetingBriefing(id, topic);
        } else {
          briefData = await getBriefing(id);
          if (!briefData) {
            briefData = await generateMeetingBriefing(id);
          }
        }
        setBriefing(briefData);
      } catch (err) {
        console.error("Failed to load briefing", err);
      } finally {
        setLoading(false);
      }
    }
    loadBriefing();
  }, [id, router, topic]);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const freshBrief = await generateMeetingBriefing(id, topic || undefined);
      setBriefing(freshBrief);
    } catch (err) {
      console.error("Failed to compile fresh briefing", err);
      alert("Failed to regenerate briefing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading || !person || !briefing) {
    return (
      <div className="flex flex-col gap-10 w-full mt-4">
        <div className="flex justify-between items-center w-full">
          <SkeletonBlock className="h-6 w-32" />
          <div className="flex gap-4">
            <SkeletonBlock className="h-10 w-24 rounded-full" />
            <SkeletonBlock className="h-10 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SkeletonBlock className="h-44 w-full rounded-custom-lg" />
          <SkeletonBlock className="md:col-span-2 h-44 w-full rounded-custom-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SkeletonBlock className="h-80 w-full rounded-custom-lg" />
          <SkeletonBlock className="h-80 w-full rounded-custom-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-16 select-none print:bg-white print:p-0">
      
      {/* Action panel header */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/people/${person.id}`}
          className="
            flex 
            items-center 
            gap-2 
            text-[14px] 
            font-bold 
            text-text-sub 
            hover:text-black 
            transition-colors 
            duration-300
          "
        >
          <ArrowLeft size={16} />
          <span>Back to Dossier</span>
        </Link>

        {/* Action utility bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="
              flex 
              items-center 
              gap-2 
              px-5 
              py-3.5 
              rounded-custom-sm 
              bg-white 
              text-black 
              border 
              border-black/5 
              font-bold 
              text-[13px] 
              shadow-sm 
              hover:bg-black/5 
              transition-all 
              duration-300
            "
          >
            <Printer size={16} />
            <span>Print Brief</span>
          </button>

          <button
            onClick={handleRegenerate}
            className="
              flex 
              items-center 
              gap-2.5 
              px-5 
              py-3.5 
              rounded-custom-sm 
              bg-black 
              text-white 
              font-bold 
              text-[13px] 
              shadow-md 
              hover:bg-black/90 
              transition-all 
              duration-300
            "
          >
            <Sparkles size={16} />
            <span>Regenerate Brief</span>
          </button>
        </div>
      </div>

      {/* Profile summary banner */}
      <div className="flex items-center justify-between border-b border-black/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black text-white rounded-custom-sm shadow-md print:bg-gray-100 print:text-black">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h2 className="text-[28px] font-extrabold text-text-main tracking-tight leading-none">
              Briefing Dossier: {person.name}
            </h2>
            <p className="text-[14px] font-medium text-text-sub mt-2">
              Prepared for upcoming sync meeting with {person.role} at {person.company}.
            </p>
          </div>
        </div>
        <span className="text-[12px] font-bold text-text-sub bg-white/60 px-4 py-2 border border-black/5 rounded-full print:border-gray-200">
          Last compiled: {new Date(briefing.created_at || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main Briefing Card Panels */}
      <BriefingCard content={briefing.content} name={person.name} personId={person.id} />

    </div>
  );
}

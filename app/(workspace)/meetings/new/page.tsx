"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, FileText, Calendar, User, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MemoryCard from '@/components/MemoryCard';
import { getPeople, saveMeeting, generateUUID } from '@/lib/supabase';
import { HindsightMemorySDK } from '@/lib/hindsight';
import { extractMeetingMemories } from '@/lib/gemini';
import { Person, Memory } from '@/lib/types';
import { SkeletonBlock } from '@/components/LoadingStates';

export default function NewMeeting() {
  const router = useRouter();
  
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  
  // Form States
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().substring(0, 10));
  const [meetingNotes, setMeetingNotes] = useState('');
  
  // Memory Extraction States
  const [extracting, setExtracting] = useState(false);
  const [extractedMemories, setExtractedMemories] = useState<Omit<Memory, 'id'>[]>([]);
  const [savedMeeting, setSavedMeeting] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPeopleList() {
      try {
        const pList = await getPeople();
        setPeople(pList);
        if (pList.length > 0) {
          setSelectedPersonId(pList[0].id);
        }
      } catch (err) {
        console.error("Error loading contacts list", err);
      } finally {
        setLoadingPeople(false);
      }
    }
    loadPeopleList();
  }, []);

  const handleGenerateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !meetingTitle || !meetingNotes) {
      alert("Please fill in the contact name, meeting title, and notes.");
      return;
    }

    setExtracting(true);
    setExtractedMemories([]);
    
    try {
      // Call Gemini Server Action to extract memories
      const extractions = await extractMeetingMemories(meetingNotes, selectedPersonId);
      setExtractedMemories(extractions);
    } catch (err) {
      console.error("Failed to extract memories", err);
      alert("Failed to analyze notes. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveMeeting = async () => {
    if (saving) return;
    setSaving(true);
    
    try {
      const meetingId = generateUUID();
      const meetingData = {
        id: meetingId,
        person_id: selectedPersonId,
        title: meetingTitle,
        notes: meetingNotes,
        meeting_date: new Date(meetingDate).toISOString(),
        created_at: new Date().toISOString(),
      };

      // 1. Save Meeting to database
      await saveMeeting(meetingData);

      // 2. Retain extracted memories in Hindsight SDK
      if (extractedMemories.length > 0) {
        await HindsightMemorySDK.retain(selectedPersonId, extractedMemories);
      }

      // 3. Route to Person's Profile page
      router.push(`/people/${selectedPersonId}`);
    } catch (err) {
      console.error("Error saving meeting dossier", err);
      alert("Failed to save meeting data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeExtractedMemory = (idx: number) => {
    setExtractedMemories(extractedMemories.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-10 w-full pb-16 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Side: Meeting Logging Form */}
        <GlassCard hoverable={false} className="p-8 h-fit">
          <h3 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-5 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-black" />
            Log Conversation Notes
          </h3>

          {loadingPeople ? (
            <div className="flex flex-col gap-6">
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-44 w-full" />
            </div>
          ) : (
            <form onSubmit={handleGenerateMemory} className="flex flex-col gap-6">
              {/* Select Person */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} />
                  Select Contact
                </label>
                <select
                  value={selectedPersonId}
                  onChange={(e) => {
                    setSelectedPersonId(e.target.value);
                    setExtractedMemories([]); // Reset preview if contact changes
                  }}
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
                    focus:outline-none 
                    focus:border-black/20 
                    transition-all
                  "
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.company})
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting Title */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} />
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Q2 Product Alignment, Architecture Review"
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

              {/* Meeting Date */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} />
                  Meeting Date
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
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
                    focus:outline-none 
                    focus:border-black/20 
                    transition-all
                  "
                />
              </div>

              {/* Meeting Notes */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-main uppercase tracking-wider">
                  Conversation Transcripts or Notes
                </label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Paste raw transcripts, bullet points, or notes. Include details on action items, worries, billing issues, preferences, or scheduled promises."
                  rows={8}
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
                    resize-none 
                    leading-relaxed
                  "
                />
              </div>

              <button
                type="submit"
                disabled={extracting}
                className="
                  flex 
                  items-center 
                  justify-center 
                  gap-3 
                  w-full 
                  py-4.5 
                  rounded-custom-sm 
                  bg-black 
                  text-white 
                  font-bold 
                  text-[14px] 
                  shadow-md 
                  hover:bg-black/90 
                  disabled:opacity-50 
                  transition-all 
                  duration-300
                "
              >
                <Sparkles size={16} />
                <span>{extracting ? "Extracting Memories..." : "Generate Relationship Memory"}</span>
              </button>
            </form>
          )}
        </GlassCard>

        {/* Right Side: Gemini Extracted Memory Review Sandbox */}
        <div className="flex flex-col gap-8 h-full justify-between">
          <GlassCard hoverable={false} className="p-8 flex-1 flex flex-col gap-5 border-dashed border-black/10">
            <h3 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-5 flex items-center gap-2">
              <Brain size={20} className="text-black" />
              Extracted Memory Review
            </h3>

            {extracting ? (
              <div className="flex flex-col gap-4 flex-1 justify-center py-12">
                <SkeletonBlock className="h-20 w-full rounded-custom-md" />
                <SkeletonBlock className="h-20 w-full rounded-custom-md" />
                <SkeletonBlock className="h-20 w-full rounded-custom-md" />
              </div>
            ) : extractedMemories.length > 0 ? (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[420px] pr-2 scrollbar-thin">
                <p className="text-[13px] text-text-sub font-semibold mb-2">
                  Review the memories extracted by Gemini below. You can dismiss irrelevant facts before committing to long-term memory.
                </p>
                {extractedMemories.map((memory, idx) => (
                  <div key={idx} className="relative group">
                    <MemoryCard
                      memory={{
                        id: String(idx),
                        person_id: selectedPersonId,
                        type: memory.type,
                        content: memory.content,
                        confidence: memory.confidence,
                      }}
                    />
                    <button
                      onClick={() => removeExtractedMemory(idx)}
                      className="
                        absolute 
                        -top-2 
                        -right-2 
                        bg-white 
                        text-text-sub 
                        hover:text-accent-red 
                        p-1.5 
                        rounded-full 
                        border 
                        border-black/5 
                        shadow-sm 
                        opacity-0 
                        group-hover:opacity-100 
                        transition-opacity 
                        duration-200
                      "
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6">
                <Brain size={44} className="text-black/5 mb-4 animate-bounce" />
                <h4 className="text-[15px] font-bold text-text-sub">Waiting for analysis</h4>
                <p className="text-[13px] text-text-sub max-w-[280px] mt-2 leading-relaxed">
                  Fill in the notes on the left and trigger analysis to review relationship memory details.
                </p>
              </div>
            )}
          </GlassCard>

          {/* Confirm & Save Button Panel */}
          {extractedMemories.length > 0 && !extracting && (
            <button
              onClick={handleSaveMeeting}
              disabled={saving}
              className="
                flex 
                items-center 
                justify-center 
                gap-3 
                w-full 
                py-5 
                rounded-custom-sm 
                bg-accent-green 
                hover:bg-accent-green/90 
                text-white 
                font-extrabold 
                text-[15px] 
                shadow-md 
                disabled:opacity-50 
                transition-all 
                duration-300
              "
            >
              <CheckCircle2 size={20} />
              <span>{saving ? "Storing memory..." : "Confirm & Save Meeting"}</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

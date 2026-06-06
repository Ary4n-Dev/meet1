"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Brain, Award, ShieldAlert, Sparkles, MessageSquare, AlertTriangle, ArrowLeft, Edit2, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MeetingTimeline from '@/components/MeetingTimeline';
import MemoryCard from '@/components/MemoryCard';
import { getPersonById, getMeetings, getMemories, savePerson } from '@/lib/supabase';
import { generateRelationshipSummary, generateMemoryInsights } from '@/lib/gemini';
import { Person, Meeting, Memory } from '@/lib/types';
import { PersonProfileSkeleton } from '@/components/LoadingStates';
import { motion, AnimatePresence } from 'framer-motion';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PersonProfile({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  // Edit Contact modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editRelationshipScore, setEditRelationshipScore] = useState(85);
  const [editSkills, setEditSkills] = useState('');
  const [editInterests, setEditInterests] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const openEditModal = () => {
    if (!person) return;
    setEditName(person.name);
    setEditRole(person.role);
    setEditCompany(person.company);
    setEditAvatarUrl(person.avatar_url);
    setEditRelationshipScore(person.relationship_score);
    setEditSkills(person.skills ? person.skills.join(', ') : '');
    setEditInterests(person.interests ? person.interests.join(', ') : '');
    setIsEditModalOpen(true);
  };

  const handleSaveContact = async () => {
    if (!person) return;
    if (!editName || !editRole || !editCompany || !editAvatarUrl) {
      alert("Please fill in all basic fields.");
      return;
    }
    setSavingContact(true);
    try {
      const updatedPerson: Person = {
        ...person,
        name: editName,
        role: editRole,
        company: editCompany,
        avatar_url: editAvatarUrl,
        relationship_score: editRelationshipScore,
        skills: editSkills ? editSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        interests: editInterests ? editInterests.split(',').map((i) => i.trim()).filter(Boolean) : [],
      };

      const saved = await savePerson(updatedPerson);
      setPerson(saved);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to save edited contact", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSavingContact(false);
    }
  };

  // AI Briefing topic modal states
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [meetingTopic, setMeetingTopic] = useState('General Alignment Sync');

  const submitGenerateBriefing = () => {
    if (!meetingTopic.trim()) {
      alert("Please enter a meeting topic.");
      return;
    }
    setIsBriefingModalOpen(false);
    setGeneratingBriefing(true);
    router.push(`/briefing/${id}?topic=${encodeURIComponent(meetingTopic.trim())}`);
  };
  
  // AI Generated summaries
  const [relationshipSummary, setRelationshipSummary] = useState<{
    summary: string;
    repeatedConcerns: string[];
    openCommitments: string[];
    communicationStyle: string[];
  } | null>(null);

  const [insights, setInsights] = useState<{
    totalMeetings: number;
    topicsDiscussed: string[];
    lastContact: string;
    openCommitmentsCount: number;
  } | null>(null);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const pData = await getPersonById(id);
        if (!pData) {
          router.push('/people');
          return;
        }
        setPerson(pData);

        const [meetingsData, memoriesData] = await Promise.all([
          getMeetings(id),
          getMemories(id),
        ]);

        setMeetings(meetingsData);
        setMemories(memoriesData);

        // Fetch AI relationship summaries and insights
        const [sumData, insData] = await Promise.all([
          generateRelationshipSummary(id, memoriesData),
          generateMemoryInsights(id),
        ]);

        setRelationshipSummary(sumData);
        setInsights(insData);
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [id, router]);

  const handleGenerateBriefing = () => {
    setIsBriefingModalOpen(true);
  };

  if (loading || !person) {
    return (
      <div className="mt-4">
        <PersonProfileSkeleton />
      </div>
    );
  }

  // Score color helper
  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-accent-green/10 text-accent-green border-accent-green/20';
    if (score >= 75) return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20';
    if (score >= 60) return 'bg-accent-orange/10 text-accent-orange border-accent-orange/20';
    return 'bg-accent-red/10 text-accent-red border-accent-red/20';
  };

  return (
    <div className="flex flex-col gap-10 w-full pb-16 select-none">
      
      {/* Back to list banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/people"
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
          <span>Back to Directory</span>
        </Link>

        {/* Actions panel */}
        <div className="flex items-center gap-3">
          <button
            onClick={openEditModal}
            className="
              flex 
              items-center 
              gap-2 
              px-5 
              py-4 
              rounded-custom-sm 
              bg-white 
              text-black 
              border 
              border-black/5 
              font-bold 
              text-[14px] 
              shadow-sm 
              hover:bg-black/5 
              transition-all 
              duration-300
            "
          >
            <Edit2 size={16} />
            <span>Edit Contact</span>
          </button>

          <button
            onClick={handleGenerateBriefing}
            disabled={generatingBriefing}
            className="
              flex 
              items-center 
              gap-3 
              px-7 
              py-4 
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
            <span>{generatingBriefing ? "Synthesizing Memory..." : "Generate Prep Briefing"}</span>
          </button>
        </div>
      </div>

      {/* Header Profile Dossier */}
      <div className="glass-panel p-10 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={person.avatar_url}
            alt={person.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover"
          />
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <h2 className="text-[32px] font-extrabold text-text-main tracking-tight leading-tight">{person.name}</h2>
            <p className="text-[16px] font-semibold text-text-sub">{person.role} at <span className="text-black font-bold">{person.company}</span></p>

            {/* Display skills and interests tags */}
            {((person.skills && person.skills.length > 0) || (person.interests && person.interests.length > 0)) && (
              <div className="flex flex-col gap-2.5 mt-3 select-none">
                {person.skills && person.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-extrabold text-text-sub uppercase tracking-wider mr-1">Skills:</span>
                    {person.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-accent-blue/10 border border-accent-blue/10 text-accent-blue text-[11px] font-extrabold rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {person.interests && person.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-extrabold text-text-sub uppercase tracking-wider mr-1">Interests:</span>
                    {person.interests.map((interest, i) => (
                      <span key={i} className="px-2.5 py-1 bg-accent-orange/10 border border-accent-orange/10 text-accent-orange text-[11px] font-extrabold rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Relationship Health Gauge */}
        <div className={`flex flex-col items-center justify-center p-6 rounded-custom-md border ${getScoreBg(person.relationship_score)}`}>
          <span className="text-[36px] font-extrabold tracking-tight leading-none">{person.relationship_score}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider mt-2">Relationship Score</span>
        </div>
      </div>

      {/* Profile Details segment grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2-span): AI Summaries and Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* AI Relationship Summary */}
          {relationshipSummary && (
            <GlassCard hoverable={false} className="p-8 flex flex-col gap-6">
              <h3 className="text-[18px] font-bold text-text-main flex items-center gap-2 border-b border-black/5 pb-5 mb-1">
                <Brain size={20} className="text-black" />
                AI Relationship Summary
              </h3>

              <div className="flex flex-col gap-6">
                <p className="text-[15px] font-semibold text-text-main leading-relaxed">
                  {relationshipSummary.summary}
                </p>

                {/* Sub panels for summary details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Repeated concerns */}
                  <div className="bg-white/40 border border-white/20 p-5 rounded-custom-sm flex flex-col gap-4">
                    <span className="text-[12px] font-bold text-text-main uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-accent-orange" />
                      Repeated Concerns
                    </span>
                    <ul className="flex flex-col gap-2.5">
                      {relationshipSummary.repeatedConcerns.map((c, i) => (
                        <li key={i} className="text-[13px] text-text-sub leading-normal flex items-start gap-2">
                          <span className="text-accent-orange font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Open commitments */}
                  <div className="bg-white/40 border border-white/20 p-5 rounded-custom-sm flex flex-col gap-4">
                    <span className="text-[12px] font-bold text-text-main uppercase tracking-wide flex items-center gap-1.5">
                      <Award size={14} className="text-accent-blue" />
                      Open Commitments
                    </span>
                    <ul className="flex flex-col gap-2.5">
                      {relationshipSummary.openCommitments.map((c, i) => (
                        <li key={i} className="text-[13px] text-text-sub leading-normal flex items-start gap-2">
                          <span className="text-accent-blue font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Communication style */}
                <div className="mt-4 pt-4 border-t border-black/5 flex flex-wrap gap-2.5 items-center">
                  <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider mr-2">Communication Style:</span>
                  {relationshipSummary.communicationStyle.map((style, i) => (
                    <span key={i} className="px-4 py-1.5 bg-black/5 text-text-main text-[13px] font-semibold rounded-full border border-black/5">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Meeting Timeline */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-bold text-text-main px-2">Conversation History</h3>
            <MeetingTimeline meetings={meetings} />
          </div>

        </div>

        {/* Right Column (1-span): Memory Insights */}
        <div className="flex flex-col gap-8">
          
          {/* Memory Insights Card */}
          {insights && (
            <GlassCard hoverable={false} className="p-8 flex flex-col gap-5">
              <h3 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-4 mb-2">Memory Insights</h3>
              
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider">Sync Meetings</span>
                  <p className="text-[24px] font-extrabold text-text-main mt-0.5">{insights.totalMeetings}</p>
                </div>

                <div>
                  <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider">Last Sync</span>
                  <p className="text-[15px] font-bold text-text-main mt-0.5">
                    {new Date(insights.lastContact).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider">Pending Promises</span>
                  <p className="text-[15px] font-bold text-text-main mt-0.5">{insights.openCommitmentsCount} items active</p>
                </div>

                <div>
                  <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider">Core Topics</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {insights.topicsDiscussed.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-black/5 text-text-sub text-[12px] font-bold rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Memory Facts list */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[15px] font-bold uppercase tracking-wider text-text-sub px-2">Memory Bank Extractions</h4>
            <div className="flex flex-col gap-4">
              {memories.length > 0 ? (
                memories.slice(0, 5).map((mem) => (
                  <MemoryCard key={mem.id} memory={mem} />
                ))
              ) : (
                <div className="p-6 text-center text-text-sub text-[13px] font-semibold border-2 border-dashed border-black/5 rounded-custom-md">
                  No explicit memories compiled yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Contact Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
            >
              <GlassCard hoverable={false} className="p-8 flex flex-col gap-6 relative shadow-premium-hover max-h-[90vh] overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-6 right-6 text-text-sub hover:text-black p-1 hover:bg-black/5 rounded-full"
                >
                  <X size={16} />
                </button>

                <h4 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-4">Edit Contact Profile</h4>

                <div className="flex flex-col gap-5">
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Role field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Role</label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Company field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Avatar URL field */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={editAvatarUrl} 
                        alt="preview" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md shrink-0" 
                        onError={(e) => {
                          // Handle image load error if URL is broken
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";
                        }}
                      />
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Avatar Image URL</label>
                        <input
                          type="text"
                          value={editAvatarUrl}
                          onChange={(e) => setEditAvatarUrl(e.target.value)}
                          className="px-4 py-2 bg-white/60 border border-white/40 rounded-custom-sm text-[13px] text-text-main focus:outline-none focus:border-black/20"
                          placeholder="Paste image URL (HTTPS)..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Or Upload Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Image is too large. Please select an image under 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setEditAvatarUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[12px] text-text-sub file:mr-3 file:py-2 file:px-4 file:rounded-custom-sm file:border-0 file:text-[12px] file:font-bold file:bg-black file:text-white file:cursor-pointer hover:file:bg-black/80"
                      />
                    </div>
                  </div>

                  {/* Relationship Score Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Relationship Score</label>
                      <span className="text-[12px] font-extrabold text-black bg-white px-2.5 py-1 rounded border border-black/5 shadow-sm">{editRelationshipScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editRelationshipScore}
                      onChange={(e) => setEditRelationshipScore(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/60 rounded-lg appearance-none cursor-pointer accent-black border border-white/40 py-0"
                    />
                  </div>

                  {/* Skills field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Professional Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Interests field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Interests & Hobbies (comma-separated)</label>
                    <input
                      type="text"
                      value={editInterests}
                      onChange={(e) => setEditInterests(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="
                      flex-1 
                      py-3.5 
                      bg-white 
                      text-black 
                      border 
                      border-black/5 
                      font-bold 
                      text-[13px] 
                      rounded-custom-sm 
                      hover:bg-black/5 
                      transition-all
                    "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={savingContact}
                    className="
                      flex-1 
                      py-3.5 
                      bg-black 
                      text-white 
                      font-bold 
                      text-[13px] 
                      rounded-custom-sm 
                      hover:bg-black/90 
                      disabled:opacity-50
                      transition-all
                    "
                  >
                    {savingContact ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Briefing Topic Modal */}
      <AnimatePresence>
        {isBriefingModalOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <GlassCard hoverable={false} className="p-8 flex flex-col gap-6 relative shadow-premium-hover">
                <button
                  onClick={() => setIsBriefingModalOpen(false)}
                  className="absolute top-6 right-6 text-text-sub hover:text-black p-1 hover:bg-black/5 rounded-full"
                >
                  <X size={16} />
                </button>

                <div className="flex flex-col gap-2">
                  <h4 className="text-[18px] font-bold text-text-main flex items-center gap-2">
                    <Sparkles size={18} className="text-accent-blue animate-pulse" />
                    AI Briefing Focus
                  </h4>
                  <p className="text-[13px] text-text-sub leading-relaxed">
                    Enter the topic or focus of your upcoming sync. Gemini will compile previous history, skills, and interests tailored to this focus.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Topic input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Meeting Focus / Topic</label>
                    <input
                      type="text"
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                      placeholder="e.g. Q3 Project Alignment, Pricing Review"
                    />
                  </div>

                  {/* Quick Suggestions */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider">Quick Templates:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "General Relationship Sync",
                        "Q3 Project Alignment",
                        "Contract & Pricing Review",
                        "Technical Architecture Sync"
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => setMeetingTopic(item)}
                          className="px-3 py-1.5 bg-black/5 hover:bg-black/10 text-text-main text-[11px] font-semibold rounded-full border border-black/5 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setIsBriefingModalOpen(false)}
                    className="
                      flex-1 
                      py-3.5 
                      bg-white 
                      text-black 
                      border 
                      border-black/5 
                      font-bold 
                      text-[13px] 
                      rounded-custom-sm 
                      hover:bg-black/5 
                      transition-all
                    "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitGenerateBriefing}
                    className="
                      flex-1 
                      py-3.5 
                      bg-black 
                      text-white 
                      font-bold 
                      text-[13px] 
                      rounded-custom-sm 
                      hover:bg-black/90 
                      transition-all
                    "
                  >
                    Generate Briefing
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquareCode, ArrowUpRight, HelpCircle, Plus, X } from 'lucide-react';
import GlassCard from './GlassCard';
import { saveMemories, generateUUID } from '@/lib/supabase';

interface BriefingContent {
  relationshipScore: number;
  previousConcerns: string[];
  openCommitments: string[];
  recentTopics: string[];
  suggestedTalkingPoints: string[];
  riskAssessment: string;
  recommendedFollowUps: string[];
}

interface BriefingCardProps {
  content: BriefingContent;
  name: string;
  personId: string;
}

export default function BriefingCard({ content, name, personId }: BriefingCardProps) {
  const [concerns, setConcerns] = useState<string[]>(content.previousConcerns);
  const [commitments, setCommitments] = useState<string[]>(content.openCommitments);

  useEffect(() => {
    setConcerns(content.previousConcerns);
  }, [content.previousConcerns]);

  useEffect(() => {
    setCommitments(content.openCommitments);
  }, [content.openCommitments]);

  // Inline inputs state
  const [isAddingConcern, setIsAddingConcern] = useState(false);
  const [newConcern, setNewConcern] = useState('');
  const [savingConcern, setSavingConcern] = useState(false);

  const [isAddingCommitment, setIsAddingCommitment] = useState(false);
  const [newCommitment, setNewCommitment] = useState('');
  const [savingCommitment, setSavingCommitment] = useState(false);

  const handleAddConcern = async () => {
    if (!newConcern.trim()) return;
    setSavingConcern(true);
    try {
      const memoryItem = {
        id: generateUUID(),
        person_id: personId,
        type: 'concern' as const,
        content: newConcern.trim(),
        confidence: 1.0,
        created_at: new Date().toISOString()
      };
      await saveMemories([memoryItem]);
      setConcerns([...concerns, memoryItem.content]);
      setNewConcern('');
      setIsAddingConcern(false);
    } catch (err) {
      console.error("Failed to add concern inline", err);
      alert("Failed to save concern. Please try again.");
    } finally {
      setSavingConcern(false);
    }
  };

  const handleAddCommitment = async () => {
    if (!newCommitment.trim()) return;
    setSavingCommitment(true);
    try {
      const memoryItem = {
        id: generateUUID(),
        person_id: personId,
        type: 'promise' as const,
        content: newCommitment.trim(),
        confidence: 1.0,
        created_at: new Date().toISOString()
      };
      await saveMemories([memoryItem]);
      setCommitments([...commitments, memoryItem.content]);
      setNewCommitment('');
      setIsAddingCommitment(false);
    } catch (err) {
      console.error("Failed to add commitment inline", err);
      alert("Failed to save commitment. Please try again.");
    } finally {
      setSavingCommitment(false);
    }
  };
  const getRiskColor = (assessment: string) => {
    const text = assessment.toLowerCase();
    if (text.includes('high risk') || text.includes('critical')) {
      return {
        bg: 'bg-accent-red/10 border-accent-red/20',
        text: 'text-accent-red',
        icon: <ShieldAlert size={20} className="text-accent-red" />,
      };
    }
    if (text.includes('moderate') || text.includes('warning')) {
      return {
        bg: 'bg-accent-orange/10 border-accent-orange/20',
        text: 'text-accent-orange',
        icon: <AlertTriangle size={20} className="text-accent-orange" />,
      };
    }
    return {
      bg: 'bg-accent-green/10 border-accent-green/20',
      text: 'text-accent-green',
      icon: <ShieldCheck size={20} className="text-accent-green" />,
    };
  };

  const risk = getRiskColor(content.riskAssessment);

  return (
    <div className="flex flex-col gap-8 w-full select-none">
      {/* Overview Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <GlassCard hoverable={false} className="flex flex-col justify-center items-center text-center p-8">
          <span className="text-[12px] font-bold text-text-sub uppercase tracking-wider">Relationship Readiness</span>
          <h2 className="text-[64px] font-extrabold tracking-tight mt-2 text-text-main">
            {content.relationshipScore}%
          </h2>
          <div className="w-full bg-black/5 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-black h-full rounded-full transition-all duration-500"
              style={{ width: `${content.relationshipScore}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold text-text-sub mt-4">
            Generated from {content.recentTopics.length} recent context clusters
          </span>
        </GlassCard>

        {/* Risk Assessment */}
        <div className={`lg:col-span-2 glass-panel p-8 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col justify-between gap-6 ${risk.bg}`}>
          <div className="flex items-center gap-3">
            {risk.icon}
            <h4 className={`text-[16px] font-bold uppercase tracking-wider ${risk.text}`}>AI Account Risk Assessment</h4>
          </div>
          <p className="text-[15px] font-semibold text-text-main leading-relaxed flex-1 mt-2">
            {content.riskAssessment}
          </p>
          <div className="text-[11px] font-bold text-text-sub tracking-wider uppercase pt-4 border-t border-black/5">
            Reflective Analysis System v2.0
          </div>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Historical Memories */}
        <div className="flex flex-col gap-8">
          {/* Previous Concerns */}
          <GlassCard hoverable={false} className="p-8">
            <div className="flex justify-between items-center mb-5 border-b border-black/5 pb-4">
              <h4 className="text-[15px] font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent-orange rounded-full" />
                Key Client Concerns
              </h4>
              <button
                onClick={() => setIsAddingConcern(!isAddingConcern)}
                className="flex items-center gap-1 text-[12px] font-bold text-accent-orange hover:underline cursor-pointer"
              >
                {isAddingConcern ? <X size={14} /> : <Plus size={14} />}
                <span>{isAddingConcern ? "Cancel" : "Add Concern"}</span>
              </button>
            </div>

            {isAddingConcern && (
              <div className="flex gap-2.5 mb-5 select-none bg-white/60 p-4 border border-black/5 rounded-custom-sm shadow-sm">
                <input
                  type="text"
                  value={newConcern}
                  onChange={(e) => setNewConcern(e.target.value)}
                  placeholder="Type concern (e.g. cloud pricing spikes)..."
                  className="flex-1 px-4 py-2.5 bg-white border border-black/10 rounded text-[13px] text-text-main focus:outline-none focus:border-black/25"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddConcern();
                  }}
                />
                <button
                  onClick={handleAddConcern}
                  disabled={savingConcern}
                  className="px-4 py-2 bg-accent-orange text-white rounded text-[13px] font-bold hover:bg-accent-orange/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}

            <ul className="flex flex-col gap-3">
              {concerns.length > 0 ? (
                concerns.map((concern, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[14px] leading-relaxed text-text-sub bg-white/40 p-4 rounded-custom-sm border border-white/20">
                    <span className="text-accent-orange font-bold mt-0.5">•</span>
                    <span>{concern}</span>
                  </li>
                ))
              ) : (
                <div className="text-[13px] text-text-sub italic text-center py-6">No concerns logged yet.</div>
              )}
            </ul>
          </GlassCard>

          {/* Open Commitments */}
          <GlassCard hoverable={false} className="p-8">
            <div className="flex justify-between items-center mb-5 border-b border-black/5 pb-4">
              <h4 className="text-[15px] font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent-blue rounded-full" />
                Open Promises & Action Items
              </h4>
              <button
                onClick={() => setIsAddingCommitment(!isAddingCommitment)}
                className="flex items-center gap-1 text-[12px] font-bold text-accent-blue hover:underline cursor-pointer"
              >
                {isAddingCommitment ? <X size={14} /> : <Plus size={14} />}
                <span>{isAddingCommitment ? "Cancel" : "Add Promise"}</span>
              </button>
            </div>

            {isAddingCommitment && (
              <div className="flex gap-2.5 mb-5 select-none bg-white/60 p-4 border border-black/5 rounded-custom-sm shadow-sm">
                <input
                  type="text"
                  value={newCommitment}
                  onChange={(e) => setNewCommitment(e.target.value)}
                  placeholder="Type promise (e.g. send API documentation)..."
                  className="flex-1 px-4 py-2.5 bg-white border border-black/10 rounded text-[13px] text-text-main focus:outline-none focus:border-black/25"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCommitment();
                  }}
                />
                <button
                  onClick={handleAddCommitment}
                  disabled={savingCommitment}
                  className="px-4 py-2 bg-accent-blue text-white rounded text-[13px] font-bold hover:bg-accent-blue/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}

            <ul className="flex flex-col gap-3">
              {commitments.length > 0 ? (
                commitments.map((commitment, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[14px] leading-relaxed text-text-sub bg-white/40 p-4 rounded-custom-sm border border-white/20">
                    <CheckCircle2 size={16} className="text-accent-blue shrink-0 mt-0.5" />
                    <span>{commitment}</span>
                  </li>
                ))
              ) : (
                <div className="text-[13px] text-text-sub italic text-center py-6">No commitments logged yet.</div>
              )}
            </ul>
          </GlassCard>
        </div>

        {/* Right Side: Meeting Execution */}
        <div className="flex flex-col gap-8">
          {/* Suggested Talking Points */}
          <GlassCard hoverable={false} className="p-8 bg-black/5">
            <h4 className="text-[15px] font-bold uppercase tracking-wider text-text-main mb-5 flex items-center gap-2">
              <MessageSquareCode size={18} className="text-black" />
              Suggested Meeting Agenda & Icebreakers
            </h4>
            <div className="flex flex-col gap-4">
              {content.suggestedTalkingPoints.map((point, idx) => (
                <div key={idx} className="bg-white/80 p-5 rounded-custom-sm border border-black/5 hover:border-black/20 hover:-translate-y-0.5 transition-all duration-300 shadow-sm flex items-start gap-4">
                  <span className="bg-black text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-[14px] font-semibold text-text-main leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recommended Follow-Ups */}
          <GlassCard hoverable={false} className="p-8">
            <h4 className="text-[15px] font-bold uppercase tracking-wider text-text-main mb-5 flex items-center gap-2">
              <ArrowUpRight size={18} className="text-accent-green" />
              Recommended Follow-Up Steps
            </h4>
            <ul className="flex flex-col gap-3">
              {content.recommendedFollowUps.map((action, idx) => (
                <li key={idx} className="flex items-center gap-3.5 text-[14px] text-text-sub bg-white/40 p-4 rounded-custom-sm border border-white/20">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-black/10 text-black focus:ring-black cursor-pointer"
                    defaultChecked={false}
                  />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

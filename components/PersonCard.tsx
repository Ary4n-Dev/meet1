"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare, AlertCircle, CircleEllipsis } from 'lucide-react';
import GlassCard from './GlassCard';
import { Person } from '@/lib/types';

interface PersonCardProps {
  person: Person;
  totalMeetings?: number;
  mainConcern?: string;
  openPromisesCount?: number;
  delay?: number;
}

export default function PersonCard({
  person,
  totalMeetings = 0,
  mainConcern,
  openPromisesCount = 0,
  delay = 0,
}: PersonCardProps) {
  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent-green bg-accent-green/10 border-accent-green/20';
    if (score >= 75) return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
    if (score >= 60) return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
    return 'text-accent-red bg-accent-red/10 border-accent-red/20';
  };

  return (
    <Link href={`/people/${person.id}`}>
      <GlassCard hoverable={true} delay={delay} className="flex flex-col h-full select-none">
        {/* Profile Info Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={person.avatar_url}
              alt={person.name}
              className="w-14 h-14 rounded-full border border-white shadow-sm object-cover"
            />
            <div>
              <h4 className="text-[17px] font-bold text-text-main leading-snug">{person.name}</h4>
              <p className="text-[13px] font-medium text-text-sub mt-0.5">{person.role}</p>
              <p className="text-[12px] font-semibold text-text-sub">{person.company}</p>
            </div>
          </div>

          {/* Relationship score badge */}
          <div
            className={`
              flex 
              flex-col 
              items-center 
              justify-center 
              px-3 
              py-2 
              rounded-custom-sm 
              border 
              ${getScoreColor(person.relationship_score)}
            `}
          >
            <span className="text-[18px] font-extrabold tracking-tight">{person.relationship_score}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Score</span>
          </div>
        </div>

        {/* Dynamic Context Section */}
        <div className="flex flex-col gap-3.5 mt-6 border-t border-black/5 pt-5 flex-1">
          {/* Skills and Interests preview tags */}
          {((person.skills && person.skills.length > 0) || (person.interests && person.interests.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 mb-1 select-none">
              {person.skills?.slice(0, 2).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-accent-blue/10 border border-accent-blue/10 text-accent-blue text-[10px] font-bold rounded-full">
                  {skill}
                </span>
              ))}
              {person.interests?.slice(0, 2).map((interest, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-accent-orange/10 border border-accent-orange/10 text-accent-orange text-[10px] font-bold rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          )}

          {mainConcern ? (
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-accent-orange shrink-0 mt-0.5" />
              <div className="text-[13px]">
                <span className="font-bold text-text-main">Concern: </span>
                <span className="text-text-sub line-clamp-2 leading-relaxed">{mainConcern}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-accent-green shrink-0 mt-0.5" />
              <span className="text-[13px] text-text-sub font-semibold">No critical concerns reported.</span>
            </div>
          )}

          {openPromisesCount > 0 && (
            <div className="flex items-center gap-2.5">
              <CircleEllipsis size={16} className="text-accent-blue shrink-0" />
              <span className="text-[13px] font-bold text-text-main">
                {openPromisesCount} Open commitment{openPromisesCount > 1 ? 's' : ''} pending
              </span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5 text-[12px] font-semibold text-text-sub">
          <div className="flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span>{totalMeetings} Meeting{totalMeetings !== 1 ? 's' : ''} logged</span>
          </div>
          <span className="text-black group-hover:translate-x-1 transition-transform font-bold">View Dossier →</span>
        </div>
      </GlassCard>
    </Link>
  );
}

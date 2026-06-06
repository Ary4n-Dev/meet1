"use client";

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Meeting } from '@/lib/types';
import GlassCard from './GlassCard';

interface MeetingTimelineProps {
  meetings: Meeting[];
}

export default function MeetingTimeline({ meetings }: MeetingTimelineProps) {
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMeetingId(expandedMeetingId === id ? null : id);
  };

  if (meetings.length === 0) {
    return (
      <GlassCard hoverable={false} className="py-12 flex flex-col items-center justify-center text-center">
        <Clock size={36} className="text-text-sub mb-3" />
        <p className="text-[15px] font-semibold text-text-sub">No meetings logged yet for this contact.</p>
      </GlassCard>
    );
  }

  return (
    <div className="relative border-l-2 border-black/5 ml-4 pl-8 flex flex-col gap-8">
      {meetings.map((meeting, index) => {
        const isExpanded = expandedMeetingId === meeting.id;
        const formattedDate = new Date(meeting.meeting_date).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <div key={meeting.id} className="relative group">
            {/* Timeline Circle Node */}
            <div
              className="
                absolute 
                -left-[41px] 
                top-1.5 
                w-6 
                h-6 
                rounded-full 
                bg-white 
                border-4 
                border-black 
                shadow-sm 
                transition-transform 
                duration-300 
                group-hover:scale-110
              "
            />

            {/* Meeting Card */}
            <GlassCard hoverable={false} className="p-6">
              <div className="flex flex-col gap-4">
                {/* Meeting Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-text-sub uppercase tracking-wider">
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                    <h4 className="text-[18px] font-bold text-text-main mt-1">{meeting.title}</h4>
                  </div>
                  
                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(meeting.id)}
                    className="p-2 text-text-sub hover:text-text-main hover:bg-black/5 rounded-full transition-all duration-300"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Short notes preview */}
                <p className={`text-[14px] leading-relaxed text-text-sub ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {meeting.notes}
                </p>

                {/* Expanded details container */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-black/5 flex flex-col gap-3">
                    <span className="text-[12px] font-bold text-text-main uppercase tracking-wide">Full Meeting Notes:</span>
                    <div className="bg-black/5 p-5 rounded-custom-sm text-[14px] text-text-main leading-relaxed font-mono whitespace-pre-wrap">
                      {meeting.notes}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}

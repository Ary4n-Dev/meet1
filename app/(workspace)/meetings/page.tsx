"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Calendar, User, FileText, ArrowRight, Brain } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { getPeople, getMeetings } from '@/lib/supabase';
import { Person, Meeting } from '@/lib/types';
import { SkeletonBlock } from '@/components/LoadingStates';

export default function MeetingsDirectory() {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('All');

  useEffect(() => {
    async function loadMeetingsData() {
      try {
        const [mList, pList] = await Promise.all([
          getMeetings(),
          getPeople(),
        ]);
        setMeetings(mList);
        setPeople(pList);
      } catch (err) {
        console.error("Error loading meetings data", err);
      } finally {
        setLoading(false);
      }
    }
    loadMeetingsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full mt-4">
        <div className="h-16 w-full bg-black/5 rounded-custom-md animate-pulse" />
        <div className="flex flex-col gap-6">
          <SkeletonBlock className="h-32 w-full rounded-custom-md" />
          <SkeletonBlock className="h-32 w-full rounded-custom-md" />
          <SkeletonBlock className="h-32 w-full rounded-custom-md" />
        </div>
      </div>
    );
  }

  // Filter and search logic
  const filteredMeetings = meetings.filter((meeting) => {
    const person = people.find((p) => p.id === meeting.person_id);
    const personName = person?.name || '';
    const personCompany = person?.company || '';
    
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      personCompany.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContact =
      selectedContactId === 'All' || meeting.person_id === selectedContactId;

    return matchesSearch && matchesContact;
  });

  return (
    <div className="flex flex-col gap-10 w-full pb-10 select-none">
      
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between w-full">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
          
          {/* Search box */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings by title, notes or contact name..."
              className="
                w-full 
                pl-12 
                pr-5 
                py-4
                bg-white/60 
                border 
                border-white/40 
                rounded-custom-sm 
                text-[14px] 
                text-text-main
                placeholder-text-sub
                focus:outline-none 
                focus:border-black/20 
                transition-all
                shadow-sm
              "
            />
          </div>

          {/* Contact Filter select */}
          <select
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            className="
              px-5 
              py-4
              bg-white/60 
              border 
              border-white/40 
              rounded-custom-sm 
              text-[14px] 
              text-text-main
              focus:outline-none 
              focus:border-black/20 
              transition-all
              shadow-sm
              sm:w-64
            "
          >
            <option value="All">All Contacts</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.company})
              </option>
            ))}
          </select>
        </div>

        {/* Log New Meeting Action Button */}
        <Link
          href="/meetings/new"
          className="
            flex 
            items-center 
            gap-2 
            px-6 
            py-4.5 
            bg-black 
            text-white 
            font-bold 
            text-[14px] 
            rounded-custom-sm 
            shadow-md 
            hover:bg-black/90 
            transition-all 
            duration-300
            shrink-0
            w-full md:w-auto
            justify-center
          "
        >
          <Plus size={16} />
          <span>Log Meeting</span>
        </Link>
      </div>

      {/* Meetings List/Timeline */}
      {filteredMeetings.length > 0 ? (
        <div className="flex flex-col gap-6 w-full">
          {filteredMeetings.map((meeting) => {
            const person = people.find((p) => p.id === meeting.person_id);
            const dateStr = new Date(meeting.meeting_date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <GlassCard key={meeting.id} hoverable={true} className="p-6 border border-white/40 shadow-premium-soft transition-all duration-300">
                <div className="flex flex-col gap-4">
                  
                  {/* Top info row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-black/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-black/5 rounded-full text-text-main">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-text-main leading-tight">{meeting.title}</h4>
                        <span className="text-[11px] font-semibold text-text-sub uppercase tracking-wider mt-1 block">{dateStr}</span>
                      </div>
                    </div>

                    {person && (
                      <Link
                        href={`/people/${person.id}`}
                        className="
                          flex 
                          items-center 
                          gap-2 
                          px-4 
                          py-2 
                          rounded-full 
                          bg-white/60 
                          border 
                          border-black/5 
                          hover:bg-black 
                          hover:text-white 
                          transition-all 
                          duration-300
                          text-[12px] 
                          font-bold 
                          text-text-main
                          mt-1 sm:mt-0
                        "
                      >
                        <User size={12} />
                        <span>{person.name} ({person.company})</span>
                        <ArrowRight size={12} className="shrink-0" />
                      </Link>
                    )}
                  </div>

                  {/* Notes description body */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                      <FileText size={12} />
                      Conversation Notes
                    </span>
                    <p className="text-[14px] text-text-sub leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-black/5 italic">
                      "{meeting.notes}"
                    </p>
                  </div>
                  
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center glass-panel rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col items-center justify-center gap-5">
          <div className="p-4 bg-black/5 rounded-full">
            <Brain size={32} className="text-text-sub animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-bold text-text-sub">No meetings found.</p>
            <p className="text-[13px] text-text-sub">
              {meetings.length === 0 
                ? "You haven't logged any meetings yet. Start by creating a contact, then add notes." 
                : "Try adjusting your search criteria or contact filter."}
            </p>
          </div>
          {meetings.length === 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link
                href="/people/new"
                className="
                  px-6 
                  py-3.5 
                  bg-white 
                  text-black 
                  border 
                  border-black/5 
                  font-bold 
                  text-[13px] 
                  rounded-custom-sm 
                  shadow-sm 
                  hover:bg-black/5 
                  transition-all 
                  duration-300
                "
              >
                Add New Contact
              </Link>
              <Link
                href="/meetings/new"
                className="
                  px-6 
                  py-3.5 
                  bg-black 
                  text-white 
                  font-bold 
                  text-[13px] 
                  rounded-custom-sm 
                  shadow-md 
                  hover:bg-black/90 
                  transition-all 
                  duration-300
                "
              >
                Log New Meeting
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

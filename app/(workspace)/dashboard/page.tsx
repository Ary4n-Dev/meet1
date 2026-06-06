"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, CheckSquare, Heart, PlusCircle, ArrowUpRight, Calendar, Brain } from 'lucide-react';
import StatCard from '@/components/StatCard';
import GlassCard from '@/components/GlassCard';
import { getPeople, getMeetings, getMemories } from '@/lib/supabase';
import { Person, Meeting, Memory } from '@/lib/types';
import { SkeletonBlock } from '@/components/LoadingStates';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [pData, mData, memData] = await Promise.all([
          getPeople(),
          getMeetings(),
          getMemories(),
        ]);
        setPeople(pData);
        setMeetings(mData);
        setMemories(memData);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-32 w-full rounded-custom-md" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SkeletonBlock className="lg:col-span-2 h-96 rounded-custom-lg" />
          <SkeletonBlock className="h-96 rounded-custom-lg" />
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalPeople = people.length;
  const totalMeetings = meetings.length;
  const openCommitments = memories.filter((m) => m.type === 'promise' || m.type === 'action_item').length;
  
  const avgHealthScore = people.length > 0
    ? Math.round(people.reduce((acc, curr) => acc + curr.relationship_score, 0) / people.length)
    : 80;

  // Recent Activity Feed
  const recentActivities = meetings.slice(0, 4).map((meeting) => {
    const person = people.find((p) => p.id === meeting.person_id);
    return {
      id: meeting.id,
      type: 'meeting',
      title: `Logged meeting: "${meeting.title}"`,
      targetName: person?.name || 'Unknown',
      targetId: meeting.person_id,
      date: new Date(meeting.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      notes: meeting.notes,
    };
  });

  return (
    <div className="flex flex-col gap-10 w-full pb-10 select-none">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Total Contacts"
          value={totalPeople}
          icon={Users}
          description="Monitored profiles"
          color="blue"
          delay={0.05}
        />
        <StatCard
          title="Meetings Logged"
          value={totalMeetings}
          icon={FileText}
          description="Across all accounts"
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Open Commitments"
          value={openCommitments}
          icon={CheckSquare}
          description="Promises to deliver"
          color="orange"
          delay={0.15}
        />
        <StatCard
          title="Relationship Health"
          value={`${avgHealthScore}%`}
          icon={Heart}
          description="Average client sentiment"
          color="red"
          delay={0.2}
        />
      </div>

      {/* Main Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Activities Feed */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <GlassCard hoverable={false} className="p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-5">
              <h3 className="text-[18px] font-bold text-text-main">Recent Activity Feed</h3>
              <Link href="/people" className="text-[13px] font-semibold text-text-sub hover:text-black flex items-center gap-1">
                View all contacts <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="
                      flex 
                      gap-6 
                      p-5 
                      rounded-custom-sm 
                      bg-white/40 
                      border 
                      border-white/20 
                      hover:bg-white/60 
                      transition-all 
                      duration-300
                    "
                  >
                    <div className="p-3 bg-black/5 rounded-full h-fit self-start">
                      <FileText size={18} className="text-text-main" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-[15px] font-bold text-text-main">{act.title}</h4>
                        <span className="text-[11px] font-bold text-text-sub uppercase tracking-wider">{act.date}</span>
                      </div>
                      <p className="text-[13px] text-text-sub">
                        With{' '}
                        <Link href={`/people/${act.targetId}`} className="font-bold text-black hover:underline">
                          {act.targetName}
                        </Link>
                      </p>
                      <p className="text-[13px] text-text-sub mt-2 border-l-2 border-black/5 pl-4 line-clamp-2 italic leading-relaxed">
                        "{act.notes}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-text-sub font-semibold">
                  No activity history logged. Use "New Meeting" to get started.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Columns - Sidebars details */}
        <div className="flex flex-col gap-8">
          
          {/* Quick Actions Panel */}
          <GlassCard hoverable={false} className="p-8">
            <h3 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-5 mb-5">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/meetings/new"
                className="
                  flex 
                  items-center 
                  justify-between 
                  px-6 
                  py-4.5 
                  rounded-custom-sm 
                  bg-black 
                  text-white 
                  font-bold 
                  text-[14px] 
                  shadow-md 
                  hover:bg-black/90 
                  transition-all 
                  duration-300
                "
              >
                <span>Log New Meeting Notes</span>
                <PlusCircle size={18} />
              </Link>

              <Link
                href="/people"
                className="
                  flex 
                  items-center 
                  justify-between 
                  px-6 
                  py-4.5 
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
                <span>Review Memory Bank</span>
                <Brain size={18} />
              </Link>
            </div>
          </GlassCard>

          {/* Upcoming Meetings Panel */}
          <GlassCard hoverable={false} className="p-8">
            <h3 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-5 mb-5">Upcoming Prep Briefings</h3>
            <div className="flex flex-col gap-4">
              {people.slice(0, 3).map((person, index) => (
                <div
                  key={person.id}
                  className="
                    flex 
                    items-center 
                    justify-between 
                    p-4 
                    bg-white/40 
                    rounded-custom-sm 
                    border 
                    border-white/20
                    hover:border-black/10
                    transition-all
                    duration-300
                  "
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={person.avatar_url}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-[14px] font-bold text-text-main">{person.name}</h4>
                      <p className="text-[11px] font-medium text-text-sub">{person.company}</p>
                    </div>
                  </div>
                  <Link
                    href={`/briefing/${person.id}`}
                    className="
                      p-2 
                      rounded-full 
                      bg-black/5 
                      text-text-main 
                      hover:bg-black 
                      hover:text-white 
                      transition-all 
                      duration-300
                    "
                  >
                    <Calendar size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}

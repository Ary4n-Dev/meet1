"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import PersonCard from '@/components/PersonCard';
import { getPeople, getMeetings, getMemories } from '@/lib/supabase';
import { Person, Meeting, Memory } from '@/lib/types';
import { CardGridSkeleton } from '@/components/LoadingStates';

export default function PeopleDirectory() {
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filterOptions, setFilterOptions] = useState<string[]>([]);

  useEffect(() => {
    async function loadDirectoryData() {
      try {
        const [pData, mData, memData] = await Promise.all([
          getPeople(),
          getMeetings(),
          getMemories(),
        ]);
        setPeople(pData);
        setMeetings(mData);
        setMemories(memData);

        // Gather unique companies for filter chips
        const companies = new Set<string>();
        pData.forEach((p) => {
          if (p.company) companies.add(p.company);
        });
        setFilterOptions(['All', ...Array.from(companies)]);
      } catch (err) {
        console.error("Error loading directory", err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectoryData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full mt-4">
        <div className="h-16 w-full bg-black/5 rounded-custom-md animate-pulse" />
        <CardGridSkeleton />
      </div>
    );
  }

  // Filter & Search Logic
  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCompany =
      selectedFilter === 'All' || person.company === selectedFilter;

    return matchesSearch && matchesCompany;
  });

  return (
    <div className="flex flex-col gap-10 w-full pb-10 select-none">
      
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between w-full">
        <div className="flex-1 w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            filterOptions={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            placeholder="Search contacts by name, role or company..."
          />
        </div>
        <Link
          href="/people/new"
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
          <span>Add Contact</span>
        </Link>
      </div>

      {/* Grid of contact profiles */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredPeople.map((person, index) => {
            // Calculate specific relationship metrics
            const pMeetings = meetings.filter((m) => m.person_id === person.id);
            const pMemories = memories.filter((m) => m.person_id === person.id);
            
            const mainConcern = pMemories.find((m) => m.type === 'concern')?.content;
            const openPromisesCount = pMemories.filter((m) => m.type === 'promise' || m.type === 'action_item').length;

            return (
              <PersonCard
                key={person.id}
                person={person}
                totalMeetings={pMeetings.length}
                mainConcern={mainConcern}
                openPromisesCount={openPromisesCount}
                delay={index * 0.05}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center glass-panel rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col items-center justify-center">
          <p className="text-[16px] font-bold text-text-sub">No contacts match your query.</p>
          <p className="text-[13px] text-text-sub mt-2">Try clearing your filters or check for spelling errors.</p>
        </div>
      )}
    </div>
  );
}

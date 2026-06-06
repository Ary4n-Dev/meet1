"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Camera, CheckCircle2, ArrowLeft, Heart, Award, Brain } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { savePerson, generateUUID } from '@/lib/supabase';
import { Person } from '@/lib/types';

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", // Woman 1
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", // Man 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", // Woman 2
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80", // Man 2
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80", // Woman 3
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80", // Man 3
];

export default function NewPerson() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [relationshipScore, setRelationshipScore] = useState(85);
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !company) {
      alert("Please enter Name, Role, and Company.");
      return;
    }

    setSaving(true);
    try {
      const newPerson: Person = {
        id: generateUUID(),
        name,
        role,
        company,
        avatar_url: useCustomAvatar ? customAvatarUrl : avatarUrl,
        relationship_score: Number(relationshipScore),
        skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        interests: interests ? interests.split(',').map((i) => i.trim()).filter(Boolean) : [],
      };

      await savePerson(newPerson);
      router.push('/people');
    } catch (err) {
      console.error("Failed to save contact", err);
      alert("Failed to save contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full pb-16 select-none max-w-3xl mx-auto">
      
      {/* Back navigation header */}
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
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
          <span>Go Back</span>
        </button>
      </div>

      <GlassCard hoverable={false} className="p-10">
        <h3 className="text-[22px] font-extrabold text-text-main border-b border-black/5 pb-5 mb-8 flex items-center gap-2 tracking-tight">
          <User size={24} className="text-black" />
          Add New Contact
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Avatar Selector */}
          <div className="flex flex-col gap-4">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Camera size={14} />
              Select Profile Avatar
            </label>
            
            <div className="flex items-center gap-6">
              <img
                src={useCustomAvatar ? (customAvatarUrl || PRESET_AVATARS[0]) : avatarUrl}
                alt="Preview Avatar"
                className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
              />
              
              <div className="flex flex-col gap-3">
                {/* Preset Chips */}
                {!useCustomAvatar && (
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`
                          w-11 
                          h-11 
                          rounded-full 
                          overflow-hidden 
                          border-2 
                          transition-all 
                          duration-200
                          ${avatarUrl === url ? 'border-black scale-105 shadow-sm' : 'border-transparent hover:scale-105'}
                        `}
                      >
                        <img src={url} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom URL Option */}
                {useCustomAvatar && (
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="Paste image URL (HTTPS)..."
                    className="
                      px-4 
                      py-2.5 
                      bg-white/60 
                      border 
                      border-white/40 
                      rounded-custom-sm 
                      text-[14px] 
                      text-text-main
                      placeholder-text-sub
                      focus:outline-none 
                      focus:border-black/20 
                      w-80
                    "
                  />
                )}

                <button
                  type="button"
                  onClick={() => setUseCustomAvatar(!useCustomAvatar)}
                  className="text-[12px] font-bold text-accent-blue hover:underline text-left self-start mt-1"
                >
                  {useCustomAvatar ? "Use preset avatars" : "Use custom image URL"}
                </button>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Chen, Michael Vance"
              required
              className="
                w-full 
                px-5 
                py-4.5 
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

          {/* Role Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} />
              Role Description
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Head of Infrastructure, VP Engineering"
              required
              className="
                w-full 
                px-5 
                py-4.5 
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

          {/* Company Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} />
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. CloudScale Inc., Google Cloud"
              required
              className="
                w-full 
                px-5 
                py-4.5 
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

          {/* Relationship Score Slider */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Heart size={14} className="text-accent-red" />
                Relationship Score
              </span>
              <span className="text-[14px] font-extrabold text-black bg-white px-2.5 py-1 rounded border border-black/5 shadow-sm">{relationshipScore}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={relationshipScore}
              onChange={(e) => setRelationshipScore(Number(e.target.value))}
              className="
                w-full 
                h-2 
                bg-white/60 
                rounded-lg 
                appearance-none 
                cursor-pointer 
                accent-black
                border 
                border-white/40
                py-0
              "
            />
            <span className="text-[11px] text-text-sub font-semibold">Slide to set your current perceived sentiment score.</span>
          </div>

          {/* Skills Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} />
              Professional Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, NextJS, Systems Architecture (comma-separated)"
              className="
                w-full 
                px-5 
                py-4.5 
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

          {/* Interests Field */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Brain size={14} />
              Personal Interests & Hobbies
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Gaming, Chess, Photography, Reading (comma-separated)"
              className="
                w-full 
                px-5 
                py-4.5 
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

          {/* Save Action */}
          <button
            type="submit"
            disabled={saving}
            className="
              flex 
              items-center 
              justify-center 
              gap-3 
              w-full 
              py-5 
              rounded-custom-sm 
              bg-black 
              text-white 
              font-extrabold 
              text-[15px] 
              shadow-md 
              hover:bg-black/90 
              disabled:opacity-50 
              transition-all 
              duration-300 
              mt-4
            "
          >
            <CheckCircle2 size={18} />
            <span>{saving ? "Saving Contact..." : "Create Contact Profile"}</span>
          </button>

        </form>
      </GlassCard>
    </div>
  );
}

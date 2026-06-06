"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, PlusCircle, BrainCircuit, LogOut, Edit2, Check, X, Calendar } from 'lucide-react';
import GlassCard from './GlassCard';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface SidebarProps {
  className?: string;
}

const PROFILE_AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
];

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState({
    name: 'Alex Harrison',
    role: 'Partner & VC Investor',
    avatar: PROFILE_AVATAR_PRESETS[0],
    skills: ["Relationship Intelligence", "Venture Capital", "SaaS Scaling"] as string[],
    interests: ["Tech Investing", "AI Research", "Golf"] as string[],
    aboutMe: "Passionate backer of early stage founders building cognitive systems."
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editInterests, setEditInterests] = useState('');
  const [editAboutMe, setEditAboutMe] = useState('');

  // Load profile from Supabase or localStorage on mount
  useEffect(() => {
    async function loadProfile() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const meta = user.user_metadata || {};
            const userProfile = {
              name: meta.full_name || user.email?.split('@')[0] || 'User Profile',
              role: meta.company ? `Builder at ${meta.company}` : 'Professional',
              avatar: meta.avatar_url || PROFILE_AVATAR_PRESETS[0],
              skills: meta.skills || ["Relationship Intelligence", "Venture Capital", "SaaS Scaling"],
              interests: meta.interests || ["Tech Investing", "AI Research", "Golf"],
              aboutMe: meta.about_me || "Passionate backer of early stage founders building cognitive systems.",
            };
            setProfile(userProfile);
            localStorage.setItem('meetingmind_user_profile', JSON.stringify(userProfile));
            return;
          }
        } catch (err) {
          console.error("Failed to load user profile from Supabase:", err);
        }
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('meetingmind_user_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setProfile({
              name: parsed.name || 'Alex Harrison',
              role: parsed.role || 'Partner & VC Investor',
              avatar: parsed.avatar || PROFILE_AVATAR_PRESETS[0],
              skills: parsed.skills || ["Relationship Intelligence", "Venture Capital", "SaaS Scaling"],
              interests: parsed.interests || ["Tech Investing", "AI Research", "Golf"],
              aboutMe: parsed.aboutMe || "Passionate backer of early stage founders building cognitive systems.",
            });
          } catch (e) {
            console.error("Error parsing stored user profile", e);
          }
        } else {
          // Initialize defaults
          const defaultProfile = {
            name: 'Alex Harrison',
            role: 'Partner & VC Investor',
            avatar: PROFILE_AVATAR_PRESETS[0],
            skills: ["Relationship Intelligence", "Venture Capital", "SaaS Scaling"],
            interests: ["Tech Investing", "AI Research", "Golf"],
            aboutMe: "Passionate backer of early stage founders building cognitive systems.",
          };
          setProfile(defaultProfile);
          localStorage.setItem('meetingmind_user_profile', JSON.stringify(defaultProfile));
        }
      }
    }
    loadProfile();
  }, []);

  const startEditing = () => {
    setEditName(profile.name);
    setEditRole(profile.role);
    setEditAvatar(profile.avatar);
    setEditSkills(profile.skills ? profile.skills.join(', ') : '');
    setEditInterests(profile.interests ? profile.interests.join(', ') : '');
    setEditAboutMe(profile.aboutMe || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName || !editRole) return;
    const updated = {
      name: editName,
      role: editRole,
      avatar: editAvatar,
      skills: editSkills ? editSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
      interests: editInterests ? editInterests.split(',').map(i => i.trim()).filter(Boolean) : [],
      aboutMe: editAboutMe.trim(),
    };
    setProfile(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('meetingmind_user_profile', JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const companyPart = editRole.startsWith('Builder at ') ? editRole.replace('Builder at ', '') : editRole;
        await supabase.auth.updateUser({
          data: {
            full_name: editName,
            company: companyPart,
            avatar_url: editAvatar,
            skills: updated.skills,
            interests: updated.interests,
            about_me: updated.aboutMe,
          }
        });
      } catch (err) {
        console.error("Failed to update user profile in Supabase:", err);
      }
    }

    setIsEditing(false);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contacts', href: '/people', icon: Users },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
  ];

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signOut error:", err);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('meetingmind_user_profile');
      window.location.href = '/';
    }
  };

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <>
      <aside
        className={`
          w-80 
          h-[calc(100vh-2rem)] 
          sticky 
          top-4 
          left-4 
          m-4 
          glass-panel 
          rounded-custom-xl 
          p-8 
          flex 
          flex-col 
          justify-between 
          shadow-premium-soft 
          border 
          border-white/40
          ${className}
        `}
      >
        {/* Upper Brand Section */}
        <div className="flex flex-col gap-10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-black text-white rounded-custom-sm shadow-md transition-transform duration-300 group-hover:scale-105">
              <BrainCircuit size={24} />
            </div>
            <span className="text-[22px] font-bold tracking-tight text-text-main">MeetingMind</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative 
                    flex 
                    items-center 
                    gap-4 
                    px-6 
                    py-4 
                    rounded-custom-sm 
                    text-[15px] 
                    font-semibold 
                    transition-colors 
                    duration-300 
                    z-10
                    ${isActive ? 'text-black' : 'text-text-sub hover:text-text-main'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-white/80 rounded-custom-sm -z-10 shadow-sm border border-black/5"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon size={20} className={isActive ? 'text-black' : 'text-text-sub'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Profile & Logout Section */}
        <div className="flex flex-col gap-6 border-t border-black/5 pt-6">
          <div
            onClick={startEditing}
            className="
              flex 
              items-center 
              justify-between 
              p-2.5 
              rounded-custom-sm 
              hover:bg-white/40 
              border 
              border-transparent 
              hover:border-black/5 
              cursor-pointer 
              transition-all 
              duration-300 
              group
            "
          >
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
              />
              <div className="max-w-[150px]">
                <p className="text-[14px] font-bold text-text-main truncate">{profile.name}</p>
                <p className="text-[11px] font-semibold text-text-sub truncate mt-0.5">{profile.role}</p>
              </div>
            </div>
            <Edit2 size={12} className="text-text-sub opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <button
            onClick={handleLogout}
            className="
              flex 
              items-center 
              gap-4 
              px-6 
              py-4 
              rounded-custom-sm 
              text-[15px] 
              font-semibold 
              text-text-sub 
              hover:text-accent-red 
              hover:bg-accent-red/5 
              transition-all 
              duration-300
            "
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Inline Profile Editing Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <GlassCard hoverable={false} className="p-8 flex flex-col gap-6 relative shadow-premium-hover max-h-[90vh] overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-6 right-6 text-text-sub hover:text-black p-1 hover:bg-black/5 rounded-full"
                >
                  <X size={16} />
                </button>

                <h4 className="text-[18px] font-bold text-text-main border-b border-black/5 pb-4">Setup Your Profile</h4>

                <div className="flex flex-col gap-5">
                  {/* Select avatar presets */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Choose Avatar</label>
                    <div className="flex items-center gap-4">
                      <img 
                        src={editAvatar} 
                        alt="preview" 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md shrink-0" 
                        onError={(e) => {
                          // Handle image load error if URL is broken
                          (e.target as HTMLImageElement).src = PROFILE_AVATAR_PRESETS[0];
                        }}
                      />
                      <div className="flex gap-2">
                        {PROFILE_AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditAvatar(preset)}
                            className={`
                              w-9 
                              h-9 
                              rounded-full 
                              overflow-hidden 
                              border-2 
                              ${editAvatar === preset ? 'border-black' : 'border-transparent'}
                            `}
                          >
                            <img src={preset} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Custom Avatar URL Input */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Or Paste Custom Photo URL</label>
                      <input
                        type="text"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="px-4 py-2 bg-white/60 border border-white/40 rounded-custom-sm text-[13px] text-text-main focus:outline-none focus:border-black/20"
                      />
                    </div>
                  </div>

                  {/* Input Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Input Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Your Role / Job Title</label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Input Skills */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Your Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      placeholder="e.g. Relationship Intelligence, Venture Capital"
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Input Interests */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Your Interests (comma-separated)</label>
                    <input
                      type="text"
                      value={editInterests}
                      onChange={(e) => setEditInterests(e.target.value)}
                      placeholder="e.g. Tech Investing, Golf, Cooking"
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20"
                    />
                  </div>

                  {/* Input About Me */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">About Me</label>
                    <textarea
                      value={editAboutMe}
                      onChange={(e) => setEditAboutMe(e.target.value)}
                      placeholder="Share a short bio..."
                      rows={3}
                      className="px-4 py-3 bg-white/60 border border-white/40 rounded-custom-sm text-[14px] text-text-main focus:outline-none focus:border-black/20 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
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
                    onClick={handleSave}
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
                    Save Changes
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

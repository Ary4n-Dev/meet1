-- MeetingMind Supabase Schema
-- A secure, multi-tenant setup for SaaS relationship intelligence.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: people
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  relationship_score INT NOT NULL DEFAULT 80,
  interests TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: meetings
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: memories
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'concern' | 'preference' | 'promise' | 'request' | 'action_item'
  content TEXT NOT NULL,
  confidence FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: briefings
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- RLS POLICIES (Users can only access their own data)
-- ----------------------------------------------------

-- Policies for "people"
CREATE POLICY "Users can manage their own people" 
  ON people FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for "meetings"
CREATE POLICY "Users can manage their own meetings" 
  ON meetings FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for "memories"
CREATE POLICY "Users can manage their own memories" 
  ON memories FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for "briefings"
CREATE POLICY "Users can manage their own briefings" 
  ON briefings FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

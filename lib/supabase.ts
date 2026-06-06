import { createClient } from '@supabase/supabase-js';
import { Person, Meeting, Memory, Briefing } from './types';

export const generateUUID = (): string => {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify that the environment keys are configured and are not the default placeholders
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your_actual') && 
  !supabaseAnonKey.includes('your_actual')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage Keys for Mock Mode
const KEYS = {
  PEOPLE: 'meetingmind_people',
  MEETINGS: 'meetingmind_meetings',
  MEMORIES: 'meetingmind_memories',
  BRIEFINGS: 'meetingmind_briefings',
};

// Safe localStorage access
const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// Unified Database API
export async function getPeople(): Promise<Person[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('relationship_score', { ascending: false });
      if (!error && data) return data as Person[];
      if (error) console.warn("Supabase people fetch failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase people connection failed, falling back to local:", err);
    }
  }
  return getLocalStorageItem<Person[]>(KEYS.PEOPLE, []);
}

export async function getPersonById(id: string): Promise<Person | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return data as Person;
      if (error) console.warn("Supabase person fetch failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase person connection failed, falling back to local:", err);
    }
  }
  const people = getLocalStorageItem<Person[]>(KEYS.PEOPLE, []);
  return people.find((p) => p.id === id) || null;
}

export async function savePerson(person: Person): Promise<Person> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('people')
        .upsert(person)
        .select()
        .single();
      if (!error && data) return data as Person;
      if (error) console.warn("Supabase person save failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase person save connection failed, falling back to local:", err);
    }
  }
  const people = getLocalStorageItem<Person[]>(KEYS.PEOPLE, []);
  const index = people.findIndex((p) => p.id === person.id);
  if (index >= 0) {
    people[index] = person;
  } else {
    people.push(person);
  }
  setLocalStorageItem(KEYS.PEOPLE, people);
  return person;
}

export async function getMeetings(personId?: string): Promise<Meeting[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('meetings').select('*').order('meeting_date', { ascending: false });
      if (personId) {
        query = query.eq('person_id', personId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Meeting[];
      if (error) console.warn("Supabase meetings fetch failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase meetings connection failed, falling back to local:", err);
    }
  }
  const meetings = getLocalStorageItem<Meeting[]>(KEYS.MEETINGS, []);
  if (personId) {
    return meetings
      .filter((m) => m.person_id === personId)
      .sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());
  }
  return meetings.sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());
}

export async function saveMeeting(meeting: Meeting): Promise<Meeting> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert(meeting)
        .select()
        .single();
      if (!error && data) return data as Meeting;
      if (error) console.warn("Supabase meeting save failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase meeting save connection failed, falling back to local:", err);
    }
  }
  const meetings = getLocalStorageItem<Meeting[]>(KEYS.MEETINGS, []);
  meetings.push(meeting);
  setLocalStorageItem(KEYS.MEETINGS, meetings);
  return meeting;
}

export async function getMemories(personId?: string): Promise<Memory[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('memories').select('*');
      if (personId) {
        query = query.eq('person_id', personId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Memory[];
      if (error) console.warn("Supabase memories fetch failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase memories connection failed, falling back to local:", err);
    }
  }
  const memories = getLocalStorageItem<Memory[]>(KEYS.MEMORIES, []);
  if (personId) {
    return memories.filter((m) => m.person_id === personId);
  }
  return memories;
}

export async function saveMemories(newMemories: Memory[]): Promise<Memory[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert(newMemories)
        .select();
      if (!error && data) return data as Memory[];
      if (error) console.warn("Supabase memories save failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase memories save connection failed, falling back to local:", err);
    }
  }
  const memories = getLocalStorageItem<Memory[]>(KEYS.MEMORIES, []);
  memories.push(...newMemories);
  setLocalStorageItem(KEYS.MEMORIES, memories);
  return newMemories;
}

export async function getBriefing(personId: string): Promise<Briefing | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) return data as Briefing;
      if (error) console.warn("Supabase briefing fetch failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase briefing connection failed, falling back to local:", err);
    }
  }
  const briefings = getLocalStorageItem<Briefing[]>(KEYS.BRIEFINGS, []);
  return briefings.find((b) => b.person_id === personId) || null;
}

export async function saveBriefing(briefing: Briefing): Promise<Briefing> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .upsert(briefing)
        .select()
        .single();
      if (!error && data) return data as Briefing;
      if (error) console.warn("Supabase briefing save failed, falling back to local:", error.message);
    } catch (err) {
      console.warn("Supabase briefing save connection failed, falling back to local:", err);
    }
  }
  const briefings = getLocalStorageItem<Briefing[]>(KEYS.BRIEFINGS, []);
  const index = briefings.findIndex((b) => b.person_id === briefing.person_id);
  if (index >= 0) {
    briefings[index] = briefing;
  } else {
    briefings.push(briefing);
  }
  setLocalStorageItem(KEYS.BRIEFINGS, briefings);
  return briefing;
}

// Clear mock DB data
export function clearMockDatabase() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.PEOPLE);
  localStorage.removeItem(KEYS.MEETINGS);
  localStorage.removeItem(KEYS.MEMORIES);
  localStorage.removeItem(KEYS.BRIEFINGS);
}

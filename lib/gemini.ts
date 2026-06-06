"use server";

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { Memory, MemoryType, Briefing } from './types';
import { getMeetings, getMemories, saveBriefing, getPersonById } from './supabase';

const apiKey = process.env.GEMINI_API_KEY || '';
const isGeminiConfigured = !!(apiKey && !apiKey.includes('your_actual'));
// Initialize the official @google/genai client if API key is present
const ai = isGeminiConfigured ? new GoogleGenAI({ apiKey }) : null;

// Helper to convert Zod schema to JSON schema representation (basic mapping for Gemini configuration)
function zodToJSONSchema(schema: any): any {
  // Simplistic conversion helper for the generationConfig
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const key in shape) {
      properties[key] = zodToJSONSchema(shape[key]);
      if (!(shape[key] instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    
    return {
      type: 'OBJECT',
      properties,
      required,
    };
  } else if (schema instanceof z.ZodArray) {
    return {
      type: 'ARRAY',
      items: zodToJSONSchema(schema.element),
    };
  } else if (schema instanceof z.ZodString) {
    return { type: 'STRING' };
  } else if (schema instanceof z.ZodNumber) {
    return { type: 'NUMBER' };
  } else if (schema instanceof z.ZodBoolean) {
    return { type: 'BOOLEAN' };
  } else if (schema instanceof z.ZodEnum) {
    return { type: 'STRING', enum: (schema as any)._def.values };
  }
  return { type: 'STRING' };
}

// Zod Schemas for Structured Output Validation
const ExtractedMemorySchema = z.object({
  memories: z.array(
    z.object({
      type: z.enum(['concern', 'preference', 'promise', 'request', 'action_item']),
      content: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

const RelationshipSummarySchema = z.object({
  summary: z.string(),
  repeatedConcerns: z.array(z.string()),
  openCommitments: z.array(z.string()),
  communicationStyle: z.array(z.string()),
});

const MeetingBriefingSchema = z.object({
  relationshipScore: z.number().min(0).max(100),
  previousConcerns: z.array(z.string()),
  openCommitments: z.array(z.string()),
  recentTopics: z.array(z.string()),
  suggestedTalkingPoints: z.array(z.string()),
  riskAssessment: z.string(),
  recommendedFollowUps: z.array(z.string()),
});

/**
 * Extracts structured memories from meeting notes.
 */
export async function extractMeetingMemories(notes: string, personId: string): Promise<Omit<Memory, 'id'>[]> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze these meeting notes and extract key facts to populate relationship memory.
Identify any:
- 'concern': Client worries, complaints, bottlenecks, pain points (e.g. migration cost, vendor lock-in).
- 'preference': Working style, contact choices, personal interests (e.g. prefers slack over calls, wants concise technical reviews).
- 'promise': Commitments made BY us to the client, or BY the client to us (e.g. we promise to send audit report by Tuesday).
- 'request': Requests for information, demos, features, pricing, etc.
- 'action_item': Concrete tasks assigned or pending action.

Provide a confidence level (0.0 to 1.0) for each.

Meeting Notes:
"${notes}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: zodToJSONSchema(ExtractedMemorySchema),
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = ExtractedMemorySchema.parse(JSON.parse(text));
        return parsed.memories.map((m) => ({
          person_id: personId,
          type: m.type as MemoryType,
          content: m.content,
          confidence: m.confidence,
        }));
      }
    } catch (e) {
      console.error("Gemini memory extraction failed, falling back", e);
    }
  }

  // Fallback heuristic extraction
  return heuristicExtract(notes, personId);
}

/**
 * Generates an overall relationship summary.
 */
export async function generateRelationshipSummary(
  personId: string,
  memories: Memory[]
): Promise<{
  summary: string;
  repeatedConcerns: string[];
  openCommitments: string[];
  communicationStyle: string[];
}> {
  const person = await getPersonById(personId);
  const name = person?.name || "the contact";

  if (ai && memories.length > 0) {
    try {
      const memoryString = memories.map((m) => `[${m.type.toUpperCase()}] ${m.content}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Review the historical relationship memories for ${name} (${person?.role || ''} at ${person?.company || ''}).
Provide a synthesized profile including:
1. A concise, professional overview summary (2-3 sentences).
2. Repeated concerns or core issues they often raise.
3. Open commitments or items pending fulfillment.
4. Their perceived communication style based on their statements and preferences.

Historical Memories:
${memoryString}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: zodToJSONSchema(RelationshipSummarySchema),
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (text) {
        return RelationshipSummarySchema.parse(JSON.parse(text));
      }
    } catch (e) {
      console.error("Gemini summary failed, falling back", e);
    }
  }

  // Fallback summary builder
  const concerns = memories.filter((m) => m.type === 'concern').map((m) => m.content);
  const commitments = memories.filter((m) => m.type === 'promise' || m.type === 'action_item').map((m) => m.content);
  const preferences = memories.filter((m) => m.type === 'preference').map((m) => m.content);

  return {
    summary: memories.length > 0
      ? `${name} is a contact at ${person?.company || 'their company'}.`
      : `No summary available. Start by logging conversation notes for ${name}.`,
    repeatedConcerns: concerns,
    openCommitments: commitments,
    communicationStyle: preferences.length > 0 ? preferences : ["Not specified yet"],
  };
}

/**
 * Generates a pre-meeting briefing.
 */
export async function generateMeetingBriefing(personId: string, topic?: string): Promise<Briefing> {
  const person = await getPersonById(personId);
  const meetings = await getMeetings(personId);
  const memories = await getMemories(personId);
  
  const name = person?.name || "the client";
  const role = person?.role || "";
  const company = person?.company || "";

  const skillsString = person?.skills && person.skills.length > 0 ? person.skills.join(', ') : "None specified";
  const interestsString = person?.interests && person.interests.length > 0 ? person.interests.join(', ') : "None specified";

  if (ai) {
    try {
      const meetingString = meetings.map((m) => `Meeting on ${m.meeting_date}: ${m.title}\nNotes: ${m.notes}`).join('\n\n');
      const memoryString = memories.map((m) => `[${m.type.toUpperCase()}] ${m.content}`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are preparing an executive relationship brief for a meeting with ${name} (${role} at ${company}).
${topic ? `The meeting topic or focus is: "${topic}". Make sure the suggested talking points, risk assessment, and recommended follow-ups are highly aligned with this topic.` : ''}

Contact Profile Metadata:
- Professional Skills: ${skillsString}
- Personal Interests & Hobbies: ${interestsString}
Use these skills and interests to customize the recommended icebreakers, suggested talking points, and proposed collaboration areas.

Synthesize previous meeting records, contact metadata, and extracted memories to output a comprehensive briefing.

Include:
1. Updated relationship score (0-100) reflecting their status.
2. Previous concerns we must keep in mind.
3. Open commitments that must be addressed or resolved.
4. Recent topics discussed.
5. Suggested talking points or icebreakers tailored to their context, skills, interests, and the meeting focus.
6. A risk assessment regarding account health, project delays, or friction points related to the topic.
7. Recommended follow-up actions.

Previous Meetings:
${meetingString}

Extracted Memories:
${memoryString}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: zodToJSONSchema(MeetingBriefingSchema),
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = MeetingBriefingSchema.parse(JSON.parse(text));
        const briefing: Briefing = {
          id: Math.random().toString(36).substring(7),
          person_id: personId,
          content: parsed,
          created_at: new Date().toISOString(),
        };
        await saveBriefing(briefing);
        return briefing;
      }
    } catch (e) {
      console.error("Gemini briefing failed, falling back", e);
    }
  }

  // Fallback Briefing Builder
  const concerns = memories.filter((m) => m.type === 'concern').map((m) => m.content);
  const commitments = memories.filter((m) => m.type === 'promise' || m.type === 'action_item').map((m) => m.content);
  const recentTopics = meetings.slice(0, 3).map((m) => m.title);

  // Generate customized talking points based on skills, interests, and topic
  const talkingPoints: string[] = [];
  if (topic) {
    talkingPoints.push(`Align on the core focus of: "${topic}".`);
  }
  if (person?.interests && person.interests.length > 0) {
    talkingPoints.push(`Break the ice by discussing: ${person.interests.slice(0, 2).join(' or ')}.`);
  }
  if (person?.skills && person.skills.length > 0) {
    talkingPoints.push(`Consult on their expertise in: ${person.skills.slice(0, 2).join(' & ')}.`);
  }
  commitments.slice(0, 2).forEach((c) => {
    talkingPoints.push(`Follow up on the pending item: "${c}".`);
  });
  if (talkingPoints.length === 0) {
    talkingPoints.push("Discuss general roadmap progress and next steps.");
  }

  const fallbackBriefing: Briefing = {
    id: Math.random().toString(36).substring(7),
    person_id: personId,
    content: {
      relationshipScore: person?.relationship_score || 80,
      previousConcerns: concerns,
      openCommitments: commitments,
      recentTopics: topic ? [topic, ...recentTopics] : recentTopics,
      suggestedTalkingPoints: talkingPoints,
      riskAssessment: concerns.length > 0
        ? `Focus on solving the concern of "${concerns[0]}" to secure alignment.`
        : `No critical risks. Standard alignment regarding ${topic || 'relationship progress'}.`,
      recommendedFollowUps: topic
        ? [`Send follow-up notes on "${topic}".`, ...commitments.map((c) => `Deliver on: "${c}"`)]
        : ["Log conversation notes after your next sync."]
    },
    created_at: new Date().toISOString(),
  };

  await saveBriefing(fallbackBriefing);
  return fallbackBriefing;
}

/**
 * Computes memory insights.
 */
export async function generateMemoryInsights(personId: string) {
  const meetings = await getMeetings(personId);
  const memories = await getMemories(personId);

  const topicsSet = new Set<string>();
  meetings.forEach(m => {
    // Simple topic extractor from titles
    const titleWords = m.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    titleWords.forEach(w => topicsSet.add(w.charAt(0).toUpperCase() + w.slice(1)));
  });

  const topicsDiscussed = Array.from(topicsSet).slice(0, 5);

  return {
    totalMeetings: meetings.length,
    topicsDiscussed,
    lastContact: meetings.length > 0 ? meetings[0].meeting_date : new Date().toISOString(),
    openCommitmentsCount: memories.filter(m => m.type === 'promise' || m.type === 'action_item').length,
  };
}

// Simple rule-based parser for offline/no-key usage
function heuristicExtract(notes: string, personId: string): Omit<Memory, 'id'>[] {
  const result: Omit<Memory, 'id'>[] = [];
  const lines = notes.split(/[\n.]+/).map(l => l.trim()).filter(l => l.length > 5);

  lines.forEach(line => {
    const lower = line.toLowerCase();
    
    // Concern
    if (lower.includes("worry") || lower.includes("concern") || lower.includes("afraid") || lower.includes("risk") || lower.includes("issue") || lower.includes("lock-in") || lower.includes("cost") || lower.includes("delay")) {
      result.push({
        person_id: personId,
        type: 'concern',
        content: cleanMemoryContent(line),
        confidence: 0.85
      });
    }
    // Preference
    else if (lower.includes("prefer") || lower.includes("like") || lower.includes("want") || lower.includes("request") && (lower.includes("written") || lower.includes("concise") || lower.includes("slack") || lower.includes("email"))) {
      result.push({
        person_id: personId,
        type: 'preference',
        content: cleanMemoryContent(line),
        confidence: 0.8
      });
    }
    // Promise
    else if (lower.includes("we will") || lower.includes("promise") || lower.includes("commit") || lower.includes("send by") || lower.includes("deliver")) {
      result.push({
        person_id: personId,
        type: 'promise',
        content: cleanMemoryContent(line),
        confidence: 0.9
      });
    }
    // Action Item / Request
    else if (lower.includes("should") || lower.includes("need to") || lower.includes("ask") || lower.includes("request")) {
      result.push({
        person_id: personId,
        type: 'action_item',
        content: cleanMemoryContent(line),
        confidence: 0.75
      });
    }
  });

  // Ensure we get at least some default memories if the notes are too short
  if (result.length === 0 && notes.trim().length > 0) {
    // Return empty array to avoid adding generic action item when not matching heuristics
  }

  return result;
}

function cleanMemoryContent(line: string): string {
  // Trim common starting bullets or words
  return line.replace(/^[-*•\s\d.]*(we will|they prefer|we promised to|client is concerned that|concern:)?/i, '').trim();
}

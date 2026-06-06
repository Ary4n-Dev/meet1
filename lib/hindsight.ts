import { Memory, Person, Meeting, MemoryType } from './types';
import { getMemories, saveMemories, getPersonById, savePerson, getMeetings, generateUUID } from './supabase';
import { generateRelationshipSummary } from './gemini';

/**
 * Custom Hindsight Memory SDK
 * Mimics Vectorize.io Hindsight Memory architecture for long-term agent memory.
 * Features structured memory logging, semantic/temporal recall ranking, and temporal reflective consolidation.
 */
export class HindsightMemorySDK {
  /**
   * RETAIN: Save new memory items extracted from a meeting.
   * Also calculates confidence metrics and updates db.
   */
  static async retain(personId: string, memories: Omit<Memory, 'id'>[]): Promise<Memory[]> {
    const memoriesToSave: Memory[] = memories.map((m) => ({
      ...m,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    }));

    const saved = await saveMemories(memoriesToSave);
    
    // Trigger an asynchronous reflection to update the contact summary/score
    // In a server environment, this can run in the background. We await it for direct sync feedback.
    await this.reflect(personId);

    return saved;
  }

  /**
   * RECALL: Retrieve memories relevant to a specific theme or query, sorted by relevance.
   * Relevance score is calculated using:
   * - Keyword/Semantic matching (0.5 weight)
   * - Temporal Recency decay (0.3 weight)
   * - Fact confidence rating (0.2 weight)
   */
  static async recall(personId: string, query: string): Promise<(Memory & { relevance: number })[]> {
    const memories = await getMemories(personId);
    if (memories.length === 0) return [];

    const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const now = new Date().getTime();

    const scoredMemories = memories.map((memory) => {
      // 1. Semantic Keyword Score
      let keywordMatches = 0;
      const contentLower = memory.content.toLowerCase();
      queryTokens.forEach((token) => {
        if (contentLower.includes(token)) {
          keywordMatches += 1;
        }
      });
      const semanticScore = queryTokens.length > 0 ? keywordMatches / queryTokens.length : 0.2;

      // 2. Temporal Decay Score
      const createdAtTime = memory.created_at ? new Date(memory.created_at).getTime() : now;
      const ageInDays = (now - createdAtTime) / (1000 * 60 * 60 * 24);
      // Exponential decay: newer memories score close to 1.0, older ones approach 0.2
      const temporalScore = Math.max(0.2, Math.exp(-ageInDays / 30));

      // 3. Confidence Score
      const confidenceScore = memory.confidence || 1.0;

      // Weighted combination
      const relevance = (semanticScore * 0.5) + (temporalScore * 0.3) + (confidenceScore * 0.2);

      return {
        ...memory,
        relevance: parseFloat(relevance.toFixed(3)),
      };
    });

    // Sort by relevance score descending
    return scoredMemories.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * REFLECT: Inspect existing memory bank to consolidate observations and update relationship scoring.
   * Adjusts the person's relationship_score based on the ratio of concerns/promises.
   */
  static async reflect(personId: string): Promise<void> {
    const person = await getPersonById(personId);
    if (!person) return;

    const memories = await getMemories(personId);
    if (memories.length === 0) return;

    // Calculate relationship score adjustment
    const concerns = memories.filter((m) => m.type === 'concern');
    const promises = memories.filter((m) => m.type === 'promise' || m.type === 'action_item');

    // Baseline relationship score is 80.
    // Each concern deducts 3 points, each fulfilled/addressed promise adds 2. Max 100, Min 30.
    let score = 85;
    score -= concerns.length * 4;
    score += promises.length * 2;
    score = Math.max(30, Math.min(100, score));

    // Update the person record
    const updatedPerson: Person = {
      ...person,
      relationship_score: score,
    };

    await savePerson(updatedPerson);
  }

  /**
   * RETRIEVE CONTEXT: High-level compiler that gathers recent meetings and memories
   * to construct the prompt environment for briefings.
   */
  static async retrieveContext(personId: string) {
    const person = await getPersonById(personId);
    const meetings = await getMeetings(personId);
    const memories = await getMemories(personId);

    // Retrieve top concern, preference, promise
    const topConcern = memories.find((m) => m.type === 'concern')?.content || "None documented";
    const topPromise = memories.find((m) => m.type === 'promise')?.content || "None documented";
    const topPreference = memories.find((m) => m.type === 'preference')?.content || "None documented";

    return {
      person,
      meetingsCount: meetings.length,
      lastMeetingDate: meetings[0]?.meeting_date || null,
      topConcern,
      topPromise,
      topPreference,
      allMemories: memories,
      allMeetings: meetings,
    };
  }
}

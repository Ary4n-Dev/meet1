export interface Person {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar_url: string;
  relationship_score: number; // 0-100
  interests?: string[];
  skills?: string[];
  created_at?: string;
}

export interface Meeting {
  id: string;
  person_id: string;
  title: string;
  notes: string;
  meeting_date: string;
  created_at?: string;
}

export type MemoryType = 'concern' | 'preference' | 'promise' | 'request' | 'action_item';

export interface Memory {
  id: string;
  person_id: string;
  type: MemoryType;
  content: string;
  confidence: number; // 0.0 - 1.0
  created_at?: string;
}

export interface Briefing {
  id: string;
  person_id: string;
  content: {
    relationshipScore: number;
    previousConcerns: string[];
    openCommitments: string[];
    recentTopics: string[];
    suggestedTalkingPoints: string[];
    riskAssessment: string;
    recommendedFollowUps: string[];
  };
  created_at?: string;
}

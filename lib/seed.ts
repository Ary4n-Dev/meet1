import { Person, Meeting, Memory } from './types';
import { savePerson, saveMeeting, saveMemories, getPeople, generateUUID } from './supabase';

const MOCK_PEOPLE: Omit<Person, 'id'>[] = [
  {
    name: "Sarah Chen",
    role: "Head of Platform Engineering",
    company: "CloudScale Inc.",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    relationship_score: 78
  },
  {
    name: "Rahul Sharma",
    role: "CTO",
    company: "HealthTech Systems",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    relationship_score: 92
  },
  {
    name: "Emma Wilson",
    role: "VP of Product",
    company: "DesignStudio",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    relationship_score: 85
  },
  {
    name: "David Kim",
    role: "Procurement Lead",
    company: "FinSafe Corp",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    relationship_score: 68
  },
  {
    name: "Priya Kapoor",
    role: "Director of Customer Success",
    company: "RetailFlow",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    relationship_score: 90
  }
];

const MOCK_MEETINGS = [
  {
    personIndex: 0, // Sarah Chen
    title: "Initial Technical Alignment",
    notes: "Sarah is concerned about vendor lock-in with our DB layer. She requested a detailed security audit report by Tuesday. She prefers concise, data-driven technical reviews and wants follow-up via Slack instead of recurring video syncs.",
    date: "2026-05-15T10:00:00Z",
    memories: [
      { type: 'concern', content: "Worried about DB layer vendor lock-in.", confidence: 0.95 },
      { type: 'promise', content: "Deliver detailed security audit report by Tuesday.", confidence: 0.90 },
      { type: 'preference', content: "Prefers concise, data-driven technical reviews.", confidence: 0.88 },
      { type: 'preference', content: "Wants updates and follow-ups sent via Slack instead of recurring video syncs.", confidence: 0.92 }
    ]
  },
  {
    personIndex: 0, // Sarah Chen
    title: "Security & Migration Review",
    notes: "Followed up on the security audit report. Sarah pointed out that migration costs are a bottleneck for her budget. We promised to deliver a breakdown of migration support incentives. She appreciated the concise slides and prefers Slack communication.",
    date: "2026-05-28T14:00:00Z",
    memories: [
      { type: 'concern', content: "Migration costs are currently a bottleneck for her budget.", confidence: 0.94 },
      { type: 'promise', content: "Deliver breakdown of migration support financial incentives.", confidence: 0.90 },
      { type: 'preference', content: "Appreciates concise slides for reviews.", confidence: 0.85 }
    ]
  },
  {
    personIndex: 1, // Rahul Sharma
    title: "Product Roadmap Alignment",
    notes: "Rahul is excited about the AI integration timeline. He requested a sandboxed demo environment for his developers. He is worried about HIPAA compliance audits in Q3. We promised to share our compliance certification handbook by Friday.",
    date: "2026-05-20T11:00:00Z",
    memories: [
      { type: 'request', content: "Requested a sandboxed developer demo environment.", confidence: 0.92 },
      { type: 'concern', content: "Worried about upcoming HIPAA compliance audits in Q3.", confidence: 0.96 },
      { type: 'promise', content: "Deliver our compliance certification handbook by Friday.", confidence: 0.90 }
    ]
  },
  {
    personIndex: 2, // Emma Wilson
    title: "Design Review & UI Kickoff",
    notes: "Emma prefers high-fidelity Figma files over wireframes. She has concerns about responsive performance on mobile devices. She promised to send her team's brand guidelines package. We agreed to update UI mocks next Tuesday.",
    date: "2026-05-22T09:30:00Z",
    memories: [
      { type: 'preference', content: "Prefers high-fidelity Figma reviews over rough wireframes.", confidence: 0.90 },
      { type: 'concern', content: "Concerned about responsive performance on mobile devices.", confidence: 0.92 },
      { type: 'promise', content: "Deliver updated UI mocks by next Tuesday.", confidence: 0.88 },
      { type: 'promise', content: "Emma promised to email her team's brand guidelines package.", confidence: 0.85 }
    ]
  },
  {
    personIndex: 3, // David Kim
    title: "Pricing & Contract Review",
    notes: "David has major issues with the yearly upfront billing terms. He requested a quarterly payment schedule model. He also raised concerns about liability caps in the MSA. We promised to submit our updated legal revisions.",
    date: "2026-05-25T15:00:00Z",
    memories: [
      { type: 'concern', content: "Opposes the yearly upfront billing terms model.", confidence: 0.96 },
      { type: 'request', content: "Requested a quarterly billing payment schedule.", confidence: 0.90 },
      { type: 'concern', content: "Disagrees with the liability caps in the MSA document.", confidence: 0.92 },
      { type: 'promise', content: "Submit updated legal cap revisions.", confidence: 0.88 }
    ]
  },
  {
    personIndex: 4, // Priya Kapoor
    title: "Partner Onboarding Session",
    notes: "Priya wants weekly check-ins during the first month. She is concerned about churn rates for new users during onboarding. We promised to set up custom telemetry dashboards. She loves direct email threads.",
    date: "2026-06-01T10:00:00Z",
    memories: [
      { type: 'preference', content: "Wants weekly onboarding check-ins during the first month.", confidence: 0.92 },
      { type: 'concern', content: "Worried about churn rates for new users during onboarding setup.", confidence: 0.90 },
      { type: 'promise', content: "Set up custom dashboard telemetry tracking.", confidence: 0.88 },
      { type: 'preference', content: "Prefers direct email threads.", confidence: 0.85 }
    ]
  }
];

export async function seedDatabase(force: boolean = false): Promise<void> {
  // Database seeding disabled to keep a clean slate of user-only data
  return;
}

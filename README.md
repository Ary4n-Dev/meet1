# 🧠 MeetingMind

MeetingMind is a premium AI-powered relationship intelligence platform designed for VCs, account executives, founders, and professionals who manage key stakeholder partnerships. It serves as a long-term conversation memory companion: extracting structured facts (concerns, promises, preferences) from raw meeting notes, retaining them inside a custom Hindsight Memory architecture, and compiling prep briefings before future meetings.

> **Never forget a conversation again.**

---

## 🎨 Design Philosophy
MeetingMind uses a state-of-the-art visual design inspired by Linear, Stripe, and Arc Browser:
* **Background:** Clean premium canvas (`#f3f3f3`)
* **Panels:** Glassmorphic white backing blur configurations
* **Border Radii:** Rounded panels ranging from `28px` to `40px`
* **Typography:** Bold, modern sans-serif typography with generous spacing structures
* **Animations:** Subtle and premium Framer Motion page transitions and hover effects

---

## 🏗️ Architecture & Memory Integration
MeetingMind implements a custom **Hindsight Memory SDK** mimicking vectorize.io's long-term persistent agent memory system.

### The Memory Flow:
```
Meeting Notes ──> Gemini Extraction ──> Hindsight Memory Store ──> Recall & Score Decay ──> Prep Briefing
```

* **Observation Parsing:** Gemini extracts facts tagged as `concern`, `preference`, `promise`, `request`, or `action_item` along with extraction confidence indicators.
* **Temporal Recall:** Score weights decrease as facts age (temporal decay calculations) using Hindsight's `recall()` method.
* **Reflective Consolidation:** Hindsight's `reflect()` parses relationship states to automatically update the client's `relationship_score`.

---

## ⚙️ Running Locally

### 1. Install Dependencies
Initialize package dependencies:
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
MeetingMind works **out-of-the-box immediately**! If credentials are not provided, it transparently falls back to an in-memory / `localStorage`-backed mock database and heuristic observation parser so you can preview the seed data immediately.

To enable live Google Gemini AI and live Supabase storage, rename `.env.example` to `.env.local` and add your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the platform.

---

## 📂 Project Structure
* `app/` - App Router page routes (Landing page `/`, Login `/login`, Signup `/signup`, Dashboard `/dashboard`, People `/people`, Profile `/people/[id]`, New Meeting `/meetings/new`, Brief Briefing `/briefing/[id]`)
* `components/` - GlassCard, StatCard, SearchBar, Sidebar, Navbar, LoadingStates, PersonCard, MemoryCard, MeetingTimeline, BriefingCard
* `lib/` - Types, custom Supabase clients, Gemini server actions, custom Hindsight memory library, mock database seeds
* `supabase/` - DB reference tables schemas SQL (`schema.sql`)

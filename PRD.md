# Product Requirements Document
## AI-Assisted Mental Health Treatment Plans

**Project Name:** Tava Treatment Plan Generator
**Version:** 1.0
**Date:** December 1, 2025
**Status:** Draft

---

## Executive Summary

A full-stack web application that transforms therapy session transcripts into AI-generated, personalized treatment plans. The system produces two tailored views: a clinical therapist-facing plan with ICD language and interventions, and a client-facing plan with accessible, strengths-based language.

**Key differentiator:** The system uses a "Compare & Merge" workflow where therapists input their clinical impressions *before* seeing AI output, then view both side-by-side. This reduces AI anchoring bias, preserves clinical judgment, and surfaces insights the therapist may have missed.

---

## Problem Statement

Creating and updating mental health treatment plans is:
- **Time-consuming** - Therapists spend significant time on documentation instead of client care
- **Inconsistent** - Quality and structure vary between providers
- **Poorly targeted** - Language is often too clinical for clients or too simplistic for clinicians

### User Pain Points

| Stakeholder | Pain Points |
|-------------|-------------|
| **Therapists** | Manual documentation is tedious; plans become outdated; hard to maintain consistency across clients |
| **Clients** | Treatment plans are confusing; feel disconnected from their own care; can't easily track progress |
| **Organizations** | Inconsistent documentation quality; compliance challenges; inefficient use of clinician time |

---

## Goals & Objectives

### Primary Goal
Enable therapists to generate high-quality, personalized treatment plans from session transcripts in minutes instead of hours, with appropriate versions for both clinical and client use - while preserving clinical judgment and reducing AI bias.

### Success Metrics

| Metric | Target |
|--------|--------|
| Treatment plan generation time | < 2 minutes from transcript upload |
| Therapist edit rate | < 30% of generated content requires manual edits |
| Client comprehension | Plain-language plans at 8th grade reading level or below |
| Safety flag accuracy | 95%+ detection rate for crisis/risk language |
| "AI caught something I missed" rate | >20% of sessions surface new insights |

---

## Target Users

### Primary Persona: Licensed Therapist
- **Needs:** Quick documentation, consistent clinical language, easy updates across sessions, risk visibility, tools that support (not replace) clinical judgment
- **Behaviors:** Manages 15-30 active clients, conducts 6-8 sessions daily, updates plans periodically
- **Goals:** Spend less time on paperwork, maintain quality documentation, ensure nothing falls through cracks
- **Concerns:** AI bias influencing treatment decisions, over-reliance on automation, accountability

### Secondary Persona: Therapy Client
- **Needs:** Understand their treatment plan, track progress, know what to work on between sessions
- **Behaviors:** Accesses plan occasionally, wants clarity not clinical jargon, may share with family
- **Goals:** Feel empowered in their care, understand next steps, see progress over time

---

## Features & Requirements

### MVP Features (Must Have)

#### F1: User Authentication & Role Management
**Description:** Basic authentication system with therapist and client roles
**User Story:** As a user, I want to log in securely so that I can access my role-appropriate dashboard
**Acceptance Criteria:**
- Users can register as therapist or client
- Therapists can invite/link clients to their practice
- Role-based access controls enforced on all routes
- Session management with secure tokens

#### F2: Transcript Input & Session Management
**Description:** Accept therapy session transcripts via file upload or text paste
**User Story:** As a therapist, I want to upload session transcripts so that I can generate treatment plans
**Acceptance Criteria:**
- Support .txt file upload and direct text paste
- Associate transcript with specific client and session date
- Store transcript securely with encryption at rest
- Display session history per client

#### F3: Therapist Impressions Input (Bias Mitigation)
**Description:** Require therapists to input detailed clinical impressions with evidence before AI generation
**User Story:** As a therapist, I want to document my initial impressions with supporting evidence before seeing AI output so that my clinical judgment isn't anchored by the AI
**Acceptance Criteria:**
- After uploading transcript, therapist must complete structured impressions form
- Form captures:
  - **Presenting concerns** with severity rating (mild/moderate/severe)
  - **Key transcript highlights** - therapist selects/quotes significant moments
  - **Observed themes** - patterns noticed across the session
  - **Initial goals** - what therapist believes client should work toward
  - **Suspected diagnoses** (optional) - with ICD-10 code lookup
  - **Modality considerations** - therapeutic approaches to consider
  - **Risk observations** - any safety concerns with evidence
  - **Strengths observed** - client's protective factors
  - **Session quality notes** - rapport, engagement, resistance
- Each concern/goal can have linked transcript excerpts as evidence
- Impressions are saved and timestamped before AI generation begins
- Therapist cannot skip this step (enforced workflow)
- Impressions are NOT sent to the AI - kept separate intentionally

#### F4: AI-Powered Treatment Plan Generation (Independent)
**Description:** Use GPT-4 to parse transcripts and generate structured treatment plans independently of therapist impressions
**User Story:** As a therapist, I want the AI to analyze the transcript independently so it can catch things I might have missed
**Acceptance Criteria:**
- AI generates plan from transcript only (does not see therapist impressions)
- Generate structured plan with: presenting concerns, goals (short/long-term), interventions, homework, strengths, risk indicators
- Processing completes within 2 minutes
- Handle API errors gracefully with retry logic

#### F5: Compare & Merge Workflow
**Description:** Side-by-side comparison of therapist impressions and AI-generated analysis
**User Story:** As a therapist, I want to see where my impressions align or differ from the AI so I can make informed decisions
**Acceptance Criteria:**
- Display therapist impressions alongside AI output in comparison view
- Highlight alignments (checkmarks) and divergences (attention indicators)
- Flag items AI found that therapist didn't mention ("AI surfaced")
- Flag items therapist noted that AI missed
- Provide "Merge into Plan" workflow where therapist selects/edits from both columns
- Final plan requires explicit therapist curation - no auto-accept

#### F6: Dual-View Treatment Plans
**Description:** Generate therapist-facing (clinical) and client-facing (accessible) versions
**User Story:** As a therapist, I want clinical documentation while my client sees an accessible version
**Acceptance Criteria:**
- **Therapist View:** Clinical terminology, ICD-aligned language, intervention codes, risk flags, structured format
- **Client View:** Plain language (8th grade level), strengths-based framing, actionable homework, encouraging tone
- Client view generated from the merged/approved therapist plan
- Therapist can toggle between views
- Client view not visible until therapist approves

#### F7: Therapist Dashboard
**Description:** Central hub for therapists to manage clients, sessions, and plans
**User Story:** As a therapist, I want a dashboard to manage all my clients and their treatment plans
**Acceptance Criteria:**
- View all clients with status indicators
- Access session history per client
- Upload transcripts and trigger plan generation
- Review, edit, and approve plans before client visibility

#### F8: Client Dashboard
**Description:** Client-friendly view of their treatment plan and progress
**User Story:** As a client, I want to view my treatment plan in language I understand
**Acceptance Criteria:**
- View client-facing treatment plan (approved only)
- See goals, next steps, and homework clearly
- Access session summaries
- Privacy disclaimer visible

---

### Recommended Features (Strongly Encouraged)

#### F9: Treatment Plan Versioning & History
**Description:** Track plan evolution across sessions
**User Story:** As a therapist, I want to see how treatment plans evolve over time
**Acceptance Criteria:**
- Each plan update creates a new version
- View version history with timestamps
- Compare versions side-by-side
- Show "last updated" metadata prominently

#### F10: AI Session Summaries
**Description:** Generate session summaries for both therapist and client views
**User Story:** As a therapist, I want AI-generated session summaries for my notes
**Acceptance Criteria:**
- **Therapist summary:** Clinical, suitable for documentation
- **Client summary:** "Here's what we worked on together" format
- Summaries linked to specific sessions
- Editable by therapist before client visibility

#### F11: Safety & Crisis Detection
**Description:** Flag high-risk language in transcripts for therapist review
**User Story:** As a therapist, I want to be alerted to crisis language so nothing is missed
**Acceptance Criteria:**
- Detect self-harm, suicidal ideation, harm to others language
- Display prominent flags in therapist view only
- Provide transcript excerpts that triggered flags
- Never suppress or hide concerning content
- Flags shown in comparison view with high priority

---

### Out of Scope (v1.0)

- Real-time audio/video transcription (use pre-made transcripts)
- Native mobile apps (responsive web only)
- Multi-language support
- Fine-tuning custom models
- Integration with EHR systems
- HIPAA-compliant production deployment
- AI using therapist impressions as input (intentionally separate)

---

## Technical Requirements

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes (serverless functions) |
| **Database** | PostgreSQL (via Prisma ORM) |
| **AI** | OpenAI GPT-4 API |
| **Auth** | NextAuth.js with credentials provider |
| **Hosting** | Vercel (frontend), Railway/Supabase (PostgreSQL) |

### Data Models

```
User
├── id, email, passwordHash, role (THERAPIST|CLIENT), createdAt

Therapist (extends User)
├── licenseNumber, specialty, preferences (JSON)

Client (extends User)
├── therapistId (FK), displayName

Session
├── id, clientId (FK), therapistId (FK), sessionDate, transcript, createdAt

TherapistImpressions
├── id, sessionId (FK), createdAt
├── concerns (JSON array with severity + excerptIds)
├── highlights (JSON array of transcript excerpts with timestamps)
├── themes (JSON array)
├── goals (JSON array with excerptIds)
├── diagnoses (JSON array with ICD-10 codes)
├── modality (JSON array)
├── riskObservations (JSON with severity + excerptIds)
├── strengths (JSON array with excerptIds)
├── sessionQuality (JSON: rapport, engagement, resistance notes)

AIAnalysis
├── id, sessionId (FK), rawOutput (JSON), createdAt
├── concerns (JSON array with severity + excerptIds)
├── highlights (JSON array of key transcript moments identified by AI)
├── themes (JSON array)
├── goals (JSON array with excerptIds as evidence)
├── interventions (JSON array with rationale)
├── homework (JSON array)
├── strengths (JSON array with excerptIds)
├── riskIndicators (JSON array with severity + excerptIds)

TreatmentPlan
├── id, clientId (FK), currentVersionId (FK), createdAt, updatedAt

TreatmentPlanVersion
├── id, treatmentPlanId (FK), versionNumber
├── therapistContent (JSON), clientContent (JSON)
├── sourceSessionId (FK), generatedAt, editedAt, status (DRAFT|APPROVED)

SessionSummary
├── id, sessionId (FK), therapistSummary, clientSummary, createdAt

RiskFlag
├── id, sessionId (FK), riskType, severity, excerpt, acknowledged
```

### Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Plan generation < 2 min; page loads < 2s |
| **Security** | Encrypted at rest; secure auth; no PHI logging |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Testing** | Unit tests on AI output parsing; integration tests on critical paths |

---

## AI System Design

### Prompting Strategy

**Approach:** Structured output prompting with JSON schema enforcement

**Key Design Decision:** AI analyzes transcript independently - therapist impressions are intentionally NOT included in the prompt. This ensures the AI can surface things the therapist may have missed.

**Treatment Plan Generation Flow:**
1. Receive transcript text (therapist impressions stored separately, not sent to AI)
2. First pass: Extract structured data (concerns, themes, interventions mentioned, risk indicators)
3. Second pass: Generate therapist-facing plan with clinical language
4. Parse and validate JSON output
5. Present in comparison view alongside therapist impressions
6. After therapist merges/approves: Generate client-facing version from approved plan

**Key Prompt Considerations:**
- Explicit JSON schema in system prompt
- Few-shot examples for consistent formatting
- Temperature: 0.3 for consistency
- Include safety detection keywords in extraction phase
- Prompt emphasizes "identify what's in the transcript" not "create a treatment plan"

### Compare & Merge UI Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Session: Nov 28, 2024 - Client: Jane D.                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  YOUR IMPRESSIONS                 AI ANALYSIS                   │
│  (entered before generation)      (from transcript only)        │
│  ───────────────────────────      ─────────────────────────     │
│                                                                 │
│  Presenting Concerns:             Presenting Concerns:          │
│  ☑ Work-related anxiety           ☑ Work-related anxiety   ✓    │
│  ☑ Sleep difficulties             ☑ Sleep difficulties     ✓    │
│                                   ⚡ Relationship stress         │
│                                     "Partner isn't supportive"  │
│                                                                 │
│  Goals:                           Goals:                        │
│  ☑ Reduce panic attacks           ☑ Reduce panic frequency ✓    │
│  ☑ Improve sleep hygiene          ☑ Improve sleep quality  ✓    │
│                                   ⚡ Address avoidance patterns  │
│                                                                 │
│  ⚠️ RISK FLAGS                                                  │
│  None detected                    None detected            ✓    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Legend: ✓ = Aligned  ⚡ = AI surfaced (you didn't note)        │
│                                                                 │
│  [ Create Merged Treatment Plan → ]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Safety Detection

**Risk Categories:**
- Suicidal ideation (SI)
- Self-harm behaviors
- Harm to others
- Substance abuse crisis
- Severe symptom escalation

**Detection Method:**
- Keyword and phrase pattern matching as first pass
- GPT-4 contextual analysis as second pass
- Conservative flagging (false positives preferred over false negatives)
- Always shown prominently in comparison view

---

## Bias Mitigation Strategy

This product intentionally addresses AI bias concerns through workflow design:

| Concern | Mitigation |
|---------|------------|
| **Anchoring bias** | Therapist inputs impressions *before* seeing AI output |
| **Confirmation bias** | AI works independently - doesn't see therapist impressions |
| **Over-reliance** | Merge workflow requires active curation; no auto-accept |
| **Homogenization** | AI extracts from transcript, doesn't prescribe modality |
| **Accountability** | Clear audit trail: impressions → AI analysis → merged plan |
| **Transparency** | Show divergences explicitly so therapist can evaluate |

### Positioning
This tool is a **documentation accelerator and second opinion**, not a clinical decision-maker. The therapist remains the expert; the AI handles pattern extraction and language tailoring.

---

## Scope & Constraints

### In Scope
- Web application (desktop and mobile responsive)
- Text transcript input (file upload + paste)
- Therapist impressions workflow (bias mitigation)
- Compare & merge interface
- AI-generated treatment plans (dual view)
- Basic auth with role separation
- Plan versioning and history
- Session summaries
- Safety flagging
- Synthetic/mock data only

### Constraints
- **No real PHI** - Synthetic data only for this challenge
- **Not production-grade auth** - Demonstrates concept, not HIPAA-ready
- **Single AI provider** - GPT-4 only (no model switching)
- **English only** - No multi-language support in v1
- **AI independence** - AI intentionally does not use therapist impressions

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GPT-4 produces inconsistent JSON | Medium | High | Strict schema validation, retry logic, fallback parsing |
| Safety detection misses critical flags | Low | Critical | Conservative flagging + human review required |
| Slow API response times | Medium | Medium | Streaming responses, progress indicators, async processing |
| Therapists skip impressions step | Medium | Medium | Enforce required workflow; explain the "why" in UI |
| Scope creep | High | Medium | Strict MVP definition, defer all non-core features |
| Therapist adoption resistance | Medium | High | Position as assistant; compare/merge shows AI as "second opinion" |

---

## Open Questions

1. ~~Should therapist approval be required before clients see updated plans?~~ **Yes - resolved**
2. ~~What's the preferred approach for handling API rate limits during demo?~~ **Just handle it - loading states + retry logic**
3. ~~Should we include sample/demo transcripts for easy testing?~~ **Yes - comprehensive demo dataset required**
4. ~~Is there a preferred UI component library (shadcn/ui, Chakra, etc.)?~~ **shadcn/ui**
5. ~~How detailed should the therapist impressions form be?~~ **Detailed with evidence linking - see F3**

**All open questions resolved.**

---

## Development Milestones

### Milestone 1: Foundation
- Project setup (Next.js, Prisma, PostgreSQL)
- Database schema and migrations
- Basic authentication flow
- Therapist and client dashboards (empty states)

### Milestone 2: Core Flow - Input
- Transcript upload/paste functionality
- Session management (CRUD)
- Client management for therapists
- **Therapist impressions form**

### Milestone 3: AI Integration
- GPT-4 integration setup
- Treatment plan generation prompts (transcript only)
- JSON parsing and validation
- Store AI analysis separately from impressions

### Milestone 4: Compare & Merge
- **Side-by-side comparison view**
- Alignment/divergence highlighting
- Merge workflow UI
- Generate client-facing version from approved plan

### Milestone 5: Enhanced Features
- Plan versioning and history
- Session summaries
- Safety/crisis detection
- Dual-view toggle (therapist/client)

### Milestone 6: Polish
- Error handling and edge cases
- Loading states and progress indicators
- Responsive design refinement
- Testing and documentation

---

## Demo Data Requirements

The application requires comprehensive synthetic demo data for testing and demonstration. All data must be entirely fictional with no real patient information.

### Required Demo Datasets

#### 1. Synthetic Transcripts (10-15 transcripts)
Each transcript should be 15-45 minutes of realistic therapy dialogue covering different scenarios:

| Scenario | Primary Issues | Risk Level | Session Type |
|----------|---------------|------------|--------------|
| Anxiety - Work stress | GAD, insomnia, perfectionism | Low | Initial intake |
| Depression - Life transition | MDD, grief, adjustment | Low | Follow-up |
| Anxiety - Panic disorder | Panic attacks, agoraphobia | Low | Mid-treatment |
| Relationship issues | Communication, boundaries | None | Couples (individual) |
| Trauma history | PTSD symptoms, avoidance | Moderate | Established client |
| **Crisis scenario** | Suicidal ideation, hopelessness | **High** | Urgent session |
| Substance use | Alcohol dependence, denial | Moderate | Early treatment |
| OCD patterns | Intrusive thoughts, rituals | Low | Psychoeducation |
| Teen/adolescent | School anxiety, social issues | Low | Family involved |
| Chronic pain | Pain management, depression | Low | Multidisciplinary |

#### 2. Demo Users

| Role | Name | Details |
|------|------|---------|
| Therapist | Dr. Sarah Chen | LMFT, specializes in anxiety/CBT |
| Therapist | Dr. Marcus Williams | PsyD, trauma-focused |
| Client | Alex Morgan | Anxiety/work stress case |
| Client | Jordan Rivera | Depression/life transition case |
| Client | Casey Thompson | Panic disorder case |
| Client | Taylor Kim | High-risk demo case |

#### 3. Pre-populated Treatment Plans
- 3-4 clients with existing treatment plans at various stages
- At least one client with version history (3+ versions)
- One client with approved plan visible in client view

#### 4. Demo Transcript Format

```
THERAPIST: [Timestamp] Dialogue text...
CLIENT: [Timestamp] Dialogue text...
```

Example:
```
THERAPIST: [00:00:15] Good to see you again, Alex. How has your week been?

CLIENT: [00:00:22] Honestly? Pretty rough. The presentation I mentioned last
time is coming up on Friday and I've barely slept.

THERAPIST: [00:00:35] I can hear the stress in your voice. Tell me more about
what's been happening with your sleep.

CLIENT: [00:00:42] I lie awake running through everything that could go wrong.
My heart starts racing and then I'm up for hours. I've maybe gotten four hours
a night this whole week.
```

#### 5. Seed Data Script
- Database seeding script that populates all demo data
- Reset command to restore demo state
- Flag to distinguish demo data from real data (for cleanup)

### Demo Data Guidelines

1. **Realism**: Transcripts should reflect authentic therapeutic dialogue patterns
2. **Diversity**: Cover multiple presenting issues, demographics, and treatment stages
3. **Safety testing**: Include at least one high-risk scenario to test crisis detection
4. **Progression**: Some clients should show treatment progress across sessions
5. **Edge cases**: Include transcripts with ambiguous content to test AI nuance

---

## Appendix

### References
- [Tava Health Challenge PDF](./tava_ai_assisted_treatment_plans.pdf)
- [OpenAI GPT-4 API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM Documentation](https://www.prisma.io/docs)

### Sample Therapist Impressions Form (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Clinical Impressions - Session Analysis                                    │
│  Your notes will NOT be shared with the AI - this preserves independent     │
│  analysis so the AI can surface things you might have missed.               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRESENTING CONCERNS                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ + Add Concern                                                       │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │    │
│  │ │ Concern: Work-related anxiety                                   │ │    │
│  │ │ Severity: ○ Mild  ● Moderate  ○ Severe                         │ │    │
│  │ │ Evidence: [+ Link transcript excerpt]                           │ │    │
│  │ │   └─ "I can't stop thinking about the presentation..." (12:34) │ │    │
│  │ │   └─ "My heart races every Sunday night" (18:02)               │ │    │
│  │ └─────────────────────────────────────────────────────────────────┘ │    │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │    │
│  │ │ Concern: Sleep disturbance                                      │ │    │
│  │ │ Severity: ○ Mild  ○ Moderate  ● Severe                         │ │    │
│  │ │ Evidence: [+ Link transcript excerpt]                           │ │    │
│  │ │   └─ "I haven't slept more than 4 hours in weeks" (8:15)       │ │    │
│  │ └─────────────────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KEY TRANSCRIPT HIGHLIGHTS                                                  │
│  Select moments that stood out as clinically significant                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ [View Transcript] [+ Add Highlight]                                 │    │
│  │                                                                     │    │
│  │ ⭐ "I realized I've been avoiding calls from my mom" (22:45)       │    │
│  │    Your note: Avoidance pattern - potential family conflict         │    │
│  │                                                                     │    │
│  │ ⭐ "When you said that, I felt something shift" (31:12)            │    │
│  │    Your note: Breakthrough moment - insight about control           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  OBSERVED THEMES                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ [x] Anxiety/worry    [ ] Depression    [x] Avoidance               │    │
│  │ [ ] Relationship     [x] Work/career   [ ] Trauma                  │    │
│  │ [ ] Self-esteem      [ ] Grief         [ ] Family                  │    │
│  │ [+ Add custom theme: _______________]                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  INITIAL TREATMENT GOALS                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ + Add Goal                                                          │    │
│  │                                                                     │    │
│  │ 1. Reduce anticipatory anxiety before work presentations           │    │
│  │    Timeline: ○ Short-term  ● Long-term                             │    │
│  │    Evidence: [Linked to concern: Work-related anxiety]              │    │
│  │                                                                     │    │
│  │ 2. Establish consistent sleep routine (6+ hours)                   │    │
│  │    Timeline: ● Short-term  ○ Long-term                             │    │
│  │    Evidence: [Linked to concern: Sleep disturbance]                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  DIAGNOSTIC IMPRESSIONS (Optional)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ [Search ICD-10: ________]                                          │    │
│  │                                                                     │    │
│  │ • F41.1 - Generalized anxiety disorder (Primary)                   │    │
│  │ • G47.0 - Insomnia (Secondary)                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  MODALITY CONSIDERATIONS                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ [x] CBT    [ ] ACT    [ ] DBT    [ ] Psychodynamic                 │    │
│  │ [ ] EMDR   [ ] MI     [ ] Solution-Focused   [ ] Other             │    │
│  │                                                                     │    │
│  │ Notes: Client responds well to structured approaches, homework      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  RISK OBSERVATIONS                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ○ No risk concerns observed                                        │    │
│  │ ○ Low risk - monitoring recommended                                │    │
│  │ ○ Moderate risk - safety planning discussed                        │    │
│  │ ○ High risk - immediate intervention required                      │    │
│  │                                                                     │    │
│  │ Evidence/Notes: ________________________________________________   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  CLIENT STRENGTHS                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ + Add Strength                                                      │    │
│  │                                                                     │    │
│  │ • High motivation for change                                       │    │
│  │   Evidence: "I'm ready to do whatever it takes" (5:23)             │    │
│  │                                                                     │    │
│  │ • Strong support system                                            │    │
│  │   Evidence: Mentioned supportive partner multiple times             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  SESSION QUALITY                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Rapport:      ○ Poor   ○ Fair   ● Good   ○ Excellent               │    │
│  │ Engagement:   ○ Low    ○ Medium ● High                              │    │
│  │ Resistance:   ● None   ○ Mild   ○ Moderate  ○ High                 │    │
│  │                                                                     │    │
│  │ Notes: Client was open and reflective today. Good session.          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  [ Save as Draft ]              [ Save & Generate AI Analysis → ]           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sample Treatment Plan Structure (Therapist View - After Merge)

```json
{
  "presentingConcerns": ["Generalized anxiety", "Work-related stress", "Relationship stress"],
  "clinicalImpressions": "Client presents with moderate GAD symptoms...",
  "goals": {
    "shortTerm": ["Reduce panic frequency to <2/week", "Implement daily grounding practice"],
    "longTerm": ["Develop sustainable anxiety management toolkit", "Return to baseline functioning at work"]
  },
  "interventions": ["ACT - Values clarification", "ACT - Defusion techniques"],
  "homework": ["Complete values card sort", "Practice 4-7-8 breathing daily"],
  "strengths": ["Strong social support", "High motivation", "Previous therapy success"],
  "riskIndicators": [],
  "nextSession": "Review values exercise, introduce defusion"
}
```

### Sample Treatment Plan Structure (Client View)

```json
{
  "summary": "We're working together on managing your anxiety and stress...",
  "yourGoals": [
    "Feel more in control when anxiety shows up",
    "Have fewer panic moments each week",
    "Feel confident at work again"
  ],
  "whatWeAreDoing": [
    "Exploring what matters most to you",
    "Learning to step back from anxious thoughts",
    "Practicing calming techniques that work for you"
  ],
  "yourHomework": [
    "Complete the values card sort - pick your top 5",
    "Practice the breathing exercise we learned - just 2 minutes a day"
  ],
  "yourStrengths": [
    "You have great people around you who care",
    "You're committed to feeling better",
    "You've done this work before and it helped"
  ],
  "nextTime": "We'll look at your values together and try a new technique"
}
```

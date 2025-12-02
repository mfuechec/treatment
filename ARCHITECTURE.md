# Technical Design Document
## Tava Treatment Plan Generator

**Version:** 1.0
**Date:** December 1, 2025
**Architect:** Winston (System Architect)

---

## 1. Overview

A full-stack web application that transforms therapy session transcripts into AI-generated, personalized treatment plans. The system uses a "Compare & Merge" workflow to reduce AI anchoring bias while preserving clinical judgment.

### Key Technical Challenges
1. **Bias Mitigation** - Enforce workflow where therapist inputs impressions before seeing AI output
2. **Dual-View Generation** - Clinical (therapist) and accessible (client) versions of plans
3. **Safety Detection** - Real-time crisis/risk language detection in transcripts
4. **Structured AI Output** - Consistent JSON parsing from GPT-4 responses

---

## 2. System Architecture

### Architecture Style: Serverless Monolith

Next.js App Router with API routes provides a unified codebase while leveraging serverless deployment on Vercel.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│                    (Therapist Browser / Client Browser)                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           VERCEL EDGE                                    │
│                     (CDN + Edge Middleware)                              │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APPLICATION                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      APP ROUTER (Frontend)                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │ │
│  │  │   Auth UI    │ │  Therapist   │ │   Client     │ │  Compare   │ │ │
│  │  │   Pages      │ │  Dashboard   │ │  Dashboard   │ │  & Merge   │ │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      API ROUTES (Backend)                           │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │ │
│  │  │  /api/auth   │ │ /api/sessions│ │  /api/plans  │ │  /api/ai   │ │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│        POSTGRESQL           │   │        OPENAI API           │
│    (Railway/Supabase)       │   │         (GPT-4)             │
│                             │   │                             │
│  • Users & Auth             │   │  • Transcript Analysis      │
│  • Sessions & Transcripts   │   │  • Plan Generation          │
│  • Impressions              │   │  • Safety Detection         │
│  • Treatment Plans          │   │  • Client-View Transform    │
└─────────────────────────────┘   └─────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+ (App Router) | Server components, streaming, modern React patterns |
| **Language** | TypeScript | Type safety across full stack |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development, accessible components |
| **Backend** | Next.js API Routes | Unified codebase, serverless scaling |
| **Database** | PostgreSQL | Relational integrity for clinical data |
| **ORM** | Prisma | Type-safe queries, migrations, seeding |
| **Auth** | NextAuth.js | Built-in session management, extensible |
| **AI** | OpenAI GPT-4 API | Best-in-class reasoning for clinical text |
| **Hosting** | Vercel + Railway | Optimized for Next.js + managed Postgres |
| **Validation** | Zod | Runtime validation matching TypeScript types |

---

## 4. Data Model

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│    User     │       │    Session      │       │ TherapistImpress │
├─────────────┤       ├─────────────────┤       ├──────────────────┤
│ id (PK)     │──┐    │ id (PK)         │──────▶│ id (PK)          │
│ email       │  │    │ clientId (FK)   │       │ sessionId (FK)   │
│ passwordHash│  │    │ therapistId(FK) │       │ concerns (JSON)  │
│ role        │  │    │ sessionDate     │       │ highlights (JSON)│
│ createdAt   │  │    │ transcript      │       │ themes (JSON)    │
└─────────────┘  │    │ status          │       │ goals (JSON)     │
       │         │    │ createdAt       │       │ diagnoses (JSON) │
       │         │    └─────────────────┘       │ riskObs (JSON)   │
       ▼         │            │                 │ strengths (JSON) │
┌─────────────┐  │            │                 │ createdAt        │
│  Therapist  │  │            │                 └──────────────────┘
├─────────────┤  │            │
│ id (PK)     │──┘            │                 ┌──────────────────┐
│ userId (FK) │               │                 │   AIAnalysis     │
│ licenseNum  │               │                 ├──────────────────┤
│ specialty   │               └────────────────▶│ id (PK)          │
└─────────────┘                                 │ sessionId (FK)   │
       │                                        │ concerns (JSON)  │
       │ 1:many                                 │ themes (JSON)    │
       ▼                                        │ goals (JSON)     │
┌─────────────┐                                 │ interventions    │
│   Client    │                                 │ riskIndicators   │
├─────────────┤                                 │ strengths (JSON) │
│ id (PK)     │                                 │ rawOutput (JSON) │
│ oderId (FK) │                                 │ createdAt        │
│ therapistId │                                 └──────────────────┘
│ displayName │
└─────────────┘       ┌─────────────────┐       ┌──────────────────┐
       │              │  TreatmentPlan  │       │ PlanVersion      │
       │              ├─────────────────┤       ├──────────────────┤
       └─────────────▶│ id (PK)         │──────▶│ id (PK)          │
                      │ clientId (FK)   │       │ planId (FK)      │
                      │ currentVersion  │       │ versionNum       │
                      │ createdAt       │       │ therapistContent │
                      │ updatedAt       │       │ clientContent    │
                      └─────────────────┘       │ status           │
                                                │ createdAt        │
                                                └──────────────────┘
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  THERAPIST
  CLIENT
}

enum SessionStatus {
  TRANSCRIPT_UPLOADED
  IMPRESSIONS_COMPLETE
  AI_ANALYZED
  COMPARISON_READY
  PLAN_MERGED
}

enum PlanStatus {
  DRAFT
  APPROVED
}

enum RiskLevel {
  NONE
  LOW
  MODERATE
  HIGH
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  role         Role
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  therapist    Therapist?
  client       Client?
}

model Therapist {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  licenseNumber String?
  specialty     String?
  preferences   Json?

  clients       Client[]
  sessions      Session[]
}

model Client {
  id           String         @id @default(cuid())
  userId       String         @unique
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  therapistId  String
  therapist    Therapist      @relation(fields: [therapistId], references: [id])
  displayName  String

  sessions     Session[]
  plans        TreatmentPlan[]
}

model Session {
  id           String        @id @default(cuid())
  clientId     String
  client       Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  therapistId  String
  therapist    Therapist     @relation(fields: [therapistId], references: [id])
  sessionDate  DateTime
  transcript   String        @db.Text
  status       SessionStatus @default(TRANSCRIPT_UPLOADED)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  impressions  TherapistImpressions?
  aiAnalysis   AIAnalysis?
  summary      SessionSummary?
  riskFlags    RiskFlag[]
}

model TherapistImpressions {
  id              String   @id @default(cuid())
  sessionId       String   @unique
  session         Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  concerns        Json     // [{text, severity, excerptIds}]
  highlights      Json     // [{excerpt, timestamp, note}]
  themes          Json     // [string]
  goals           Json     // [{text, timeline, excerptIds}]
  diagnoses       Json?    // [{code, description}]
  modalities      Json?    // [string]
  riskObservations Json    // {level, notes, excerptIds}
  strengths       Json     // [{text, excerptIds}]
  sessionQuality  Json?    // {rapport, engagement, resistance, notes}
  createdAt       DateTime @default(now())
}

model AIAnalysis {
  id             String   @id @default(cuid())
  sessionId      String   @unique
  session        Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  concerns       Json     // [{text, severity, excerptIds}]
  themes         Json     // [string]
  goals          Json     // [{text, timeline, excerptIds}]
  interventions  Json     // [{name, rationale}]
  homework       Json     // [{task, rationale}]
  strengths      Json     // [{text, excerptIds}]
  riskIndicators Json     // [{type, severity, excerpt}]
  rawOutput      Json     // Full GPT response for debugging
  createdAt      DateTime @default(now())
}

model TreatmentPlan {
  id               String              @id @default(cuid())
  clientId         String
  client           Client              @relation(fields: [clientId], references: [id], onDelete: Cascade)
  currentVersionId String?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  versions         TreatmentPlanVersion[]
}

model TreatmentPlanVersion {
  id               String        @id @default(cuid())
  treatmentPlanId  String
  treatmentPlan    TreatmentPlan @relation(fields: [treatmentPlanId], references: [id], onDelete: Cascade)
  versionNumber    Int
  sourceSessionId  String
  therapistContent Json          // Clinical view content
  clientContent    Json?         // Plain-language view (null until approved)
  status           PlanStatus    @default(DRAFT)
  createdAt        DateTime      @default(now())
  editedAt         DateTime?
}

model SessionSummary {
  id               String   @id @default(cuid())
  sessionId        String   @unique
  session          Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  therapistSummary String   @db.Text
  clientSummary    String?  @db.Text
  createdAt        DateTime @default(now())
}

model RiskFlag {
  id           String    @id @default(cuid())
  sessionId    String
  session      Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  riskType     String    // SI, self-harm, harm-to-others, substance, escalation
  severity     RiskLevel
  excerpt      String    @db.Text
  acknowledged Boolean   @default(false)
  createdAt    DateTime  @default(now())
}
```

---

## 5. API Design

### Authentication Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user (therapist/client) |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/session` | Get current session |

### Therapist Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/therapist/clients` | List therapist's clients |
| POST | `/api/therapist/clients` | Create/invite new client |
| GET | `/api/therapist/clients/[id]` | Get client details |
| DELETE | `/api/therapist/clients/[id]` | Remove client |

### Session Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sessions` | List sessions (filtered by role) |
| POST | `/api/sessions` | Create session with transcript |
| GET | `/api/sessions/[id]` | Get session details |
| PUT | `/api/sessions/[id]` | Update session |
| DELETE | `/api/sessions/[id]` | Delete session |

### Impressions Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sessions/[id]/impressions` | Save therapist impressions |
| GET | `/api/sessions/[id]/impressions` | Get impressions |
| PUT | `/api/sessions/[id]/impressions` | Update impressions |

### AI Analysis Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sessions/[id]/analyze` | Trigger AI analysis |
| GET | `/api/sessions/[id]/analysis` | Get AI analysis results |
| GET | `/api/sessions/[id]/compare` | Get comparison view data |

### Treatment Plan Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/plans` | List plans (filtered by role) |
| POST | `/api/plans` | Create plan from merged data |
| GET | `/api/plans/[id]` | Get plan with versions |
| PUT | `/api/plans/[id]` | Update plan |
| POST | `/api/plans/[id]/approve` | Approve plan (generates client view) |
| GET | `/api/plans/[id]/versions` | Get version history |

### Sample API Response: Compare View

```typescript
// GET /api/sessions/[id]/compare
interface CompareResponse {
  session: {
    id: string;
    sessionDate: string;
    clientName: string;
  };
  impressions: {
    concerns: Array<{
      text: string;
      severity: 'mild' | 'moderate' | 'severe';
      excerpts: string[];
    }>;
    themes: string[];
    goals: Array<{
      text: string;
      timeline: 'short' | 'long';
    }>;
    riskLevel: RiskLevel;
    strengths: string[];
  };
  aiAnalysis: {
    concerns: Array<{
      text: string;
      severity: 'mild' | 'moderate' | 'severe';
      excerpts: string[];
      matchStatus: 'aligned' | 'ai_only' | 'therapist_only';
    }>;
    themes: Array<{
      text: string;
      matchStatus: 'aligned' | 'ai_only' | 'therapist_only';
    }>;
    goals: Array<{
      text: string;
      timeline: 'short' | 'long';
      matchStatus: 'aligned' | 'ai_only' | 'therapist_only';
    }>;
    interventions: Array<{
      name: string;
      rationale: string;
    }>;
    riskIndicators: Array<{
      type: string;
      severity: RiskLevel;
      excerpt: string;
    }>;
    strengths: Array<{
      text: string;
      matchStatus: 'aligned' | 'ai_only' | 'therapist_only';
    }>;
  };
  alignmentSummary: {
    alignedCount: number;
    aiSurfacedCount: number;
    therapistOnlyCount: number;
  };
}
```

---

## 6. AI Integration Design

### GPT-4 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Transcript    │    │    Analysis     │    │   Client View   │  │
│  │    Parser       │───▶│    Generator    │───▶│   Transformer   │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│          │                      │                      │            │
│          ▼                      ▼                      ▼            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  Safety Check   │    │  JSON Validator │    │ Reading Level   │  │
│  │  (Risk Flags)   │    │   (Zod Schema)  │    │    Checker      │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Prompt Strategy

**System Prompt (Treatment Plan Analysis):**

```typescript
const ANALYSIS_SYSTEM_PROMPT = `You are a clinical documentation assistant analyzing therapy session transcripts.

Your task is to extract structured information from the transcript ONLY. Do not invent or assume information not present in the transcript.

Output Format: You MUST respond with valid JSON matching this schema:
{
  "concerns": [{"text": string, "severity": "mild"|"moderate"|"severe", "excerpts": string[]}],
  "themes": string[],
  "goals": [{"text": string, "timeline": "short"|"long", "excerpts": string[]}],
  "interventions": [{"name": string, "rationale": string}],
  "homework": [{"task": string, "rationale": string}],
  "strengths": [{"text": string, "excerpts": string[]}],
  "riskIndicators": [{"type": string, "severity": "none"|"low"|"moderate"|"high", "excerpt": string}]
}

Guidelines:
- Extract only what is explicitly stated or strongly implied in the transcript
- Include direct quotes as excerpts to support each finding
- For risk indicators, be conservative - flag anything concerning
- Suggested interventions should match what was discussed or would logically follow
- Rate severity based on client's expressed distress and functional impact

Risk Categories to Monitor:
- Suicidal ideation (SI)
- Self-harm behaviors
- Harm to others
- Substance abuse crisis
- Severe symptom escalation`;
```

**Client View Transformation Prompt:**

```typescript
const CLIENT_VIEW_PROMPT = `Transform this clinical treatment plan into client-friendly language.

Requirements:
- Use 8th grade reading level or below
- Replace clinical jargon with plain language
- Frame goals positively and as achievable
- Make homework feel supportive, not prescriptive
- Emphasize strengths and progress
- Keep an encouraging but not patronizing tone

Clinical Plan:
{therapistContent}

Output the transformed plan as JSON matching this schema:
{
  "summary": string,
  "yourGoals": string[],
  "whatWeAreDoing": string[],
  "yourHomework": string[],
  "yourStrengths": string[],
  "nextTime": string
}`;
```

### Safety Detection Pipeline

```typescript
// services/safety.ts

const RISK_KEYWORDS = {
  suicidalIdeation: [
    'kill myself', 'end it all', 'not worth living', 'better off dead',
    'suicidal', 'take my life', 'don\'t want to be here'
  ],
  selfHarm: [
    'cut myself', 'hurt myself', 'burning', 'self-harm', 'self harm'
  ],
  harmToOthers: [
    'hurt them', 'kill', 'harm someone', 'violent thoughts'
  ],
  substanceCrisis: [
    'overdose', 'blacked out', 'can\'t stop drinking', 'withdrawal'
  ]
};

interface RiskDetectionResult {
  hasRisk: boolean;
  flags: Array<{
    type: string;
    severity: RiskLevel;
    excerpt: string;
    keyword: string;
  }>;
}

async function detectRisks(transcript: string): Promise<RiskDetectionResult> {
  // Pass 1: Keyword detection (fast, catches obvious cases)
  const keywordFlags = scanForKeywords(transcript);

  // Pass 2: GPT-4 contextual analysis (catches nuanced cases)
  const contextualFlags = await analyzeContextually(transcript);

  // Merge and deduplicate
  return mergeRiskFlags(keywordFlags, contextualFlags);
}
```

### API Integration with Retry Logic

```typescript
// services/openai.ts

import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function generateAnalysis(transcript: string): Promise<AIAnalysisResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        temperature: 0.3,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this transcript:\n\n${transcript}` }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);

      // Validate against schema
      return AIAnalysisSchema.parse(parsed);

    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * (attempt + 1));
      }
    }
  }

  throw new Error(`AI analysis failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
```

---

## 7. Core Workflow Implementation

### Compare & Merge Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload     │     │   Enter      │     │   AI        │     │   Compare    │
│  Transcript  │────▶│ Impressions  │────▶│  Analysis   │────▶│   & Merge    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                    │                     │
                            │                    │                     │
                            ▼                    ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                     │   Stored     │     │   Stored     │     │   Merged     │
                     │  Separately  │     │  Separately  │     │    Plan      │
                     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │   Approve    │
                                                               │  & Generate  │
                                                               │ Client View  │
                                                               └──────────────┘
```

### State Machine: Session Status

```typescript
type SessionStatus =
  | 'TRANSCRIPT_UPLOADED'   // Initial state
  | 'IMPRESSIONS_COMPLETE'  // Therapist has entered impressions
  | 'AI_ANALYZED'           // AI analysis complete
  | 'COMPARISON_READY'      // Both available for comparison
  | 'PLAN_MERGED';          // Final plan created

const transitions: Record<SessionStatus, SessionStatus[]> = {
  'TRANSCRIPT_UPLOADED': ['IMPRESSIONS_COMPLETE'],
  'IMPRESSIONS_COMPLETE': ['AI_ANALYZED', 'COMPARISON_READY'],
  'AI_ANALYZED': ['COMPARISON_READY'],
  'COMPARISON_READY': ['PLAN_MERGED'],
  'PLAN_MERGED': [] // Terminal state
};
```

---

## 8. Security Architecture

### Authentication Flow (NextAuth.js)

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { therapist: true, client: true }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          therapistId: user.therapist?.id,
          clientId: user.client?.id
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.therapistId = user.therapistId;
        token.clientId = user.clientId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.therapistId = token.therapistId;
      session.user.clientId = token.clientId;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
};
```

### Authorization Middleware

```typescript
// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Therapist-only routes
    if (pathname.startsWith('/therapist') && token?.role !== 'THERAPIST') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Client-only routes
    if (pathname.startsWith('/client') && token?.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/therapist/:path*', '/client/:path*', '/api/sessions/:path*', '/api/plans/:path*']
};
```

### Data Security

| Concern | Implementation |
|---------|----------------|
| **Encryption at Rest** | PostgreSQL with encrypted storage (Railway/Supabase default) |
| **Encryption in Transit** | HTTPS enforced via Vercel |
| **Password Storage** | bcrypt with salt rounds = 12 |
| **Session Tokens** | HTTP-only, Secure, SameSite cookies |
| **API Authorization** | Role-based checks on every endpoint |
| **PHI Logging** | No transcript/plan content in logs |
| **Input Validation** | Zod schemas on all API inputs |

---

## 9. Frontend Architecture

### Directory Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── therapist/
│   │   ├── page.tsx              # Therapist dashboard
│   │   ├── clients/
│   │   │   ├── page.tsx          # Client list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Client detail
│   │   └── sessions/
│   │       ├── new/
│   │       │   └── page.tsx      # Upload transcript
│   │       └── [id]/
│   │           ├── page.tsx      # Session detail
│   │           ├── impressions/
│   │           │   └── page.tsx  # Impressions form
│   │           └── compare/
│   │               └── page.tsx  # Compare & merge
│   └── client/
│       ├── page.tsx              # Client dashboard
│       └── plan/
│           └── page.tsx          # View treatment plan
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── sessions/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       ├── impressions/
│   │       │   └── route.ts
│   │       ├── analyze/
│   │       │   └── route.ts
│   │       └── compare/
│   │           └── route.ts
│   └── plans/
│       ├── route.ts
│       └── [id]/
│           ├── route.ts
│           └── approve/
│               └── route.ts
├── layout.tsx
└── page.tsx                      # Landing/redirect

components/
├── ui/                           # shadcn/ui components
├── forms/
│   ├── ImpressionsForm.tsx
│   ├── TranscriptUpload.tsx
│   └── MergeWorkflow.tsx
├── comparison/
│   ├── CompareView.tsx
│   ├── AlignmentIndicator.tsx
│   └── MergePanel.tsx
├── plans/
│   ├── TherapistPlanView.tsx
│   └── ClientPlanView.tsx
└── layout/
    ├── Header.tsx
    ├── Sidebar.tsx
    └── DashboardLayout.tsx

lib/
├── prisma.ts                     # Prisma client singleton
├── auth.ts                       # Auth utilities
├── validations/                  # Zod schemas
└── utils.ts

services/
├── openai.ts                     # GPT-4 integration
├── safety.ts                     # Risk detection
└── comparison.ts                 # Alignment matching
```

### Key UI Components

**Compare & Merge View:**

```tsx
// components/comparison/CompareView.tsx

interface CompareViewProps {
  impressions: TherapistImpressions;
  aiAnalysis: AIAnalysis;
  onMerge: (mergedData: MergedPlanData) => void;
}

export function CompareView({ impressions, aiAnalysis, onMerge }: CompareViewProps) {
  const [selections, setSelections] = useState<SelectionState>({});

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: Therapist Impressions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Impressions</h2>
        <ConcernsList
          items={impressions.concerns}
          type="therapist"
          selections={selections}
          onSelect={handleSelect}
        />
        {/* ... other sections */}
      </div>

      {/* Right Column: AI Analysis */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">AI Analysis</h2>
        <ConcernsList
          items={aiAnalysis.concerns}
          type="ai"
          alignments={computeAlignments(impressions.concerns, aiAnalysis.concerns)}
          selections={selections}
          onSelect={handleSelect}
        />
        {/* ... other sections */}
      </div>

      {/* Merge Action */}
      <div className="col-span-2 mt-6">
        <Button onClick={() => onMerge(buildMergedPlan(selections))}>
          Create Merged Treatment Plan
        </Button>
      </div>
    </div>
  );
}
```

---

## 10. Deployment Architecture

### Environment Configuration

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/tava_treatment"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OpenAI
OPENAI_API_KEY="sk-..."

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=""
```

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "OPENAI_API_KEY": "@openai-api-key"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database-url"
    }
  }
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 11. Testing Strategy

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| **Unit Tests** | Vitest | 80% on services |
| **Component Tests** | React Testing Library | Key UI components |
| **Integration Tests** | Vitest + Prisma | API routes |
| **E2E Tests** | Playwright | Critical user flows |

### Critical Test Scenarios

1. **Workflow Enforcement**
   - Cannot trigger AI analysis without completing impressions
   - Cannot approve plan without completing merge

2. **Safety Detection**
   - High-risk transcript flags correctly
   - Risk flags displayed prominently
   - No false negatives on test crisis transcripts

3. **Role Authorization**
   - Therapist cannot access other therapists' clients
   - Client can only see approved plans
   - Client cannot see risk flags

4. **AI Output Validation**
   - Malformed JSON triggers retry
   - All required fields present
   - Excerpts match actual transcript content

---

## 12. Development Milestones

### Phase 1: Foundation (Days 1-2)
- [ ] Project scaffolding (Next.js, Prisma, Tailwind)
- [ ] Database schema and migrations
- [ ] NextAuth.js setup with credentials
- [ ] Basic layouts and navigation

### Phase 2: Core Input Flow (Days 3-4)
- [ ] Transcript upload/paste UI
- [ ] Session CRUD operations
- [ ] Therapist impressions form (full detail)
- [ ] Client management

### Phase 3: AI Integration (Days 5-6)
- [ ] OpenAI service layer
- [ ] Treatment plan generation
- [ ] Safety detection pipeline
- [ ] JSON validation and error handling

### Phase 4: Compare & Merge (Days 7-8)
- [ ] Comparison view UI
- [ ] Alignment matching algorithm
- [ ] Merge workflow
- [ ] Plan creation from merged data

### Phase 5: Dual Views & Polish (Days 9-10)
- [ ] Client view transformation
- [ ] Plan versioning
- [ ] Session summaries
- [ ] Error states and loading UX
- [ ] Demo data seeding

---

## 13. Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2024-12-01 | Next.js App Router | Server components, streaming support, Vercel optimization | Pages Router, separate backend |
| 2024-12-01 | PostgreSQL over MongoDB | Relational integrity critical for clinical data relationships | MongoDB (document flexibility) |
| 2024-12-01 | JSON columns for flexible data | Clinical forms evolve; JSON avoids constant migrations | Normalized tables (rigid schema) |
| 2024-12-01 | Serverless over containers | Simpler ops, auto-scaling, cost-effective for demo | Docker + Kubernetes |
| 2024-12-01 | GPT-4 over fine-tuned model | Out of scope for v1; GPT-4 handles clinical text well | Fine-tuned model, Claude |
| 2024-12-01 | shadcn/ui over Chakra | Better Tailwind integration, accessible, customizable | Chakra, MUI, Radix primitives |

---

## 14. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| GPT-4 rate limits during demo | Medium | High | Implement request queuing, show progress |
| Inconsistent AI JSON output | Medium | High | Strict Zod validation, retry logic, fallback parsing |
| Compare algorithm misalignment | Medium | Medium | Fuzzy matching, manual override in UI |
| Large transcripts timeout | Low | Medium | Chunk processing, streaming responses |
| Demo data feels unrealistic | Medium | Medium | Invest time in quality synthetic transcripts |

---

*Document generated by Winston, System Architect*

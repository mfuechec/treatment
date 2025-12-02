# OpenAI GPT-4 Integration for Tava Treatment Plan Generator

This document describes the complete OpenAI GPT-4 integration for automated clinical analysis and safety detection in the Tava Treatment Plan Generator.

## Overview

The integration provides:
1. **Automated Clinical Analysis** - GPT-4 analyzes therapy session transcripts to extract structured clinical information
2. **Safety Risk Detection** - Combined keyword scanning and AI analysis to detect safety concerns
3. **Client-Friendly Summaries** - Transforms clinical language into accessible, supportive content
4. **Comparison Tools** - Compares therapist impressions with AI analysis to identify alignment and gaps

## Files Created

### 1. Services Layer

#### `/src/services/openai.ts`
Core OpenAI service providing three main functions:

**`generateAnalysis(transcript: string)`**
- Uses GPT-4 Turbo with temperature 0.3 for consistent clinical analysis
- Extracts: concerns, themes, goals, interventions, homework, strengths, risk indicators
- Includes retry logic (3 attempts with exponential backoff)
- Returns validated, structured JSON using Zod schemas
- System prompt optimized for clinical documentation

**`generateClientView(therapistContent: object)`**
- Transforms clinical language to 8th grade reading level
- Creates warm, encouraging, collaborative content
- Returns: summary, yourGoals, whatWeAreDoing, yourHomework, yourStrengths, nextTime
- Focuses on partnership and empowerment

**`generateSessionSummary(transcript: string)`**
- Generates both therapist and client summaries in one call
- Therapist version: Professional, detailed, clinical
- Client version: Accessible, encouraging, supportive

**Key Features:**
- Proper TypeScript types and Zod validation
- Comprehensive error handling
- Detailed system prompts for clinical accuracy
- JSON response format for structured data

#### `/src/services/safety.ts`
Safety risk detection service with multi-layered approach:

**`RISK_KEYWORDS` Object**
Categorized risk keywords:
- `suicidalIdeation`: "kill myself", "suicide", "want to die", etc.
- `selfHarm`: "cut myself", "hurt myself", "self-harm", etc.
- `harmToOthers`: "hurt someone", "violent thoughts", etc.
- `substanceCrisis`: "overdose", "relapse", "can't stop using", etc.

**`scanForKeywords(transcript: string)`**
- Fast first-pass detection for immediate flagging
- Returns matches with context (100 chars before/after)
- Useful for real-time alerts

**`detectRisks(transcript: string)`**
- Combines keyword scan with GPT-4 contextual analysis
- AI distinguishes between current intent vs. past history
- Assesses severity: LOW, MODERATE, HIGH
- Deduplicates and prioritizes findings
- Returns array of `{type, severity, excerpt, keyword?}`

**Helper Functions:**
- `hasRiskKeywords()` - Quick boolean check
- `getRiskSummary()` - Statistics and highest severity

### 2. API Endpoints

#### `/src/app/api/sessions/[id]/analyze/route.ts`

**POST /api/sessions/:id/analyze**
Triggers AI analysis on a session transcript.

**Process Flow:**
1. Validates therapist access and session ownership
2. Checks transcript exists and no prior analysis
3. Calls `generateAnalysis()` to analyze transcript
4. Calls `detectRisks()` for safety screening
5. Stores results in `AIAnalysis` table
6. Creates `RiskFlag` records for each detected risk
7. Updates session status to `AI_ANALYZED` or `COMPARISON_READY`
8. Returns analysis results

**Response:**
```json
{
  "message": "AI analysis completed successfully",
  "analysis": {
    "id": "...",
    "sessionId": "...",
    "concerns": [...],
    "themes": [...],
    "goals": [...],
    "interventions": [...],
    "homework": [...],
    "strengths": [...],
    "riskIndicators": [...],
    "rawOutput": {...},
    "createdAt": "..."
  },
  "riskFlags": [...],
  "session": {
    "id": "...",
    "status": "COMPARISON_READY"
  }
}
```

**GET /api/sessions/:id/analyze**
Retrieves existing AI analysis for a session.

**Error Handling:**
- 401: Unauthorized
- 403: Session doesn't belong to therapist
- 404: Session or analysis not found
- 409: Analysis already exists (for POST)
- 500: Internal server error with details

#### `/src/app/api/sessions/[id]/compare/route.ts`

**GET /api/sessions/:id/compare**
Compares therapist impressions with AI analysis.

**Comparison Algorithm:**
- Uses Jaccard similarity for text matching
- Threshold: 50% for concerns/goals/strengths, 60% for themes
- Produces alignment indicators:
  - `aligned` - Both identified similar item
  - `ai_only` - AI detected, therapist didn't
  - `therapist_only` - Therapist noted, AI missed
  - `conflict` - Contradictory findings

**Response Structure:**
```json
{
  "sessionId": "...",
  "status": "COMPARISON_READY",
  "comparison": {
    "concerns": [
      {
        "therapist": {...},
        "ai": {...},
        "alignment": "aligned"
      }
    ],
    "themes": [...],
    "goals": [...],
    "strengths": [...],
    "interventions": [...], // AI-only
    "homework": [...], // AI-only
    "riskAssessment": {
      "therapist": {...},
      "ai": [...],
      "alignment": "aligned|ai_detected_risk|therapist_detected_risk|severity_mismatch"
    }
  },
  "stats": {
    "concerns": {
      "aligned": 5,
      "aiOnly": 2,
      "therapistOnly": 1
    },
    "themes": {...},
    "goals": {...},
    "strengths": {...},
    "overallAlignment": 75
  },
  "riskFlags": [...]
}
```

## Database Schema

The integration uses these Prisma models (already defined in schema.prisma):

### AIAnalysis
```prisma
model AIAnalysis {
  id             String   @id @default(cuid())
  sessionId      String   @unique
  session        Session  @relation(...)
  concerns       Json     // [{text, severity, excerpts}]
  themes         Json     // [string]
  goals          Json     // [{text, timeline, excerpts}]
  interventions  Json     // [{name, rationale}]
  homework       Json     // [{task, rationale}]
  strengths      Json     // [{text, excerpts}]
  riskIndicators Json     // [{type, severity, excerpt}]
  rawOutput      Json     // Full GPT response
  createdAt      DateTime @default(now())
}
```

### RiskFlag
```prisma
model RiskFlag {
  id           String    @id @default(cuid())
  sessionId    String
  session      Session   @relation(...)
  riskType     String    // Type of risk
  severity     RiskLevel // NONE, LOW, MODERATE, HIGH
  excerpt      String    @db.Text
  acknowledged Boolean   @default(false)
  createdAt    DateTime  @default(now())
}
```

### Session Status Flow
```
TRANSCRIPT_UPLOADED
    ↓
IMPRESSIONS_COMPLETE (therapist adds impressions)
    ↓
AI_ANALYZED (AI analysis completed)
    ↓
COMPARISON_READY (both impressions and AI analysis exist)
    ↓
PLAN_MERGED (final treatment plan created)
```

## Setup Instructions

### 1. Environment Variables

Ensure your `.env` file has:
```bash
OPENAI_API_KEY="sk-proj-..."  # Required for GPT-4 access
DATABASE_URL="postgresql://..." # Your PostgreSQL connection
```

### 2. Install Dependencies

Dependencies already in package.json:
- `openai@^4.94.0` - Official OpenAI SDK
- `zod@^3.24.4` - Runtime type validation
- `@prisma/client@^6.9.0` - Database client

### 3. Generate Prisma Client

If not already generated:
```bash
npm run db:generate
```

### 4. Database Migration

Ensure your database schema is up to date:
```bash
npm run db:push
```

## Usage Examples

### Analyzing a Session

```typescript
// Client-side code
const response = await fetch(`/api/sessions/${sessionId}/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
})

const data = await response.json()

if (response.ok) {
  console.log('Analysis completed:', data.analysis)
  console.log('Risk flags:', data.riskFlags)
} else {
  console.error('Analysis failed:', data.error)
}
```

### Comparing Results

```typescript
// Client-side code
const response = await fetch(`/api/sessions/${sessionId}/compare`)
const data = await response.json()

if (response.ok) {
  console.log('Overall alignment:', data.stats.overallAlignment + '%')
  console.log('Aligned concerns:', data.stats.concerns.aligned)
  console.log('AI-only suggestions:', data.comparison.interventions)
}
```

### Generating Client View

```typescript
// Server-side code
import { generateClientView } from '@/services/openai'

const clientContent = await generateClientView({
  concerns: analysis.concerns,
  themes: analysis.themes,
  goals: analysis.goals,
  interventions: analysis.interventions,
  homework: analysis.homework,
  strengths: analysis.strengths,
})

// Store in TreatmentPlanVersion.clientContent
```

## Error Handling

All functions include comprehensive error handling:

1. **Network Errors**: Retry logic with exponential backoff
2. **API Errors**: Detailed error messages and logging
3. **Validation Errors**: Zod schema validation catches malformed responses
4. **Rate Limits**: Automatic retry with backoff
5. **Timeout Handling**: Graceful degradation

Example error response:
```json
{
  "error": "Failed to generate AI analysis",
  "details": "OpenAI API rate limit exceeded. Please try again in 60 seconds."
}
```

## Security Considerations

1. **Authentication**: All endpoints require therapist authentication
2. **Authorization**: Session ownership verified before analysis
3. **Data Privacy**: Transcripts never logged; only stored in database
4. **API Key**: Stored in environment variables, never exposed to client
5. **Risk Flags**: Sensitive safety data requires acknowledgment

## Testing Recommendations

### Unit Tests
Test individual functions with mock data:
- `generateAnalysis()` with sample transcripts
- `scanForKeywords()` with known risk phrases
- `calculateSimilarity()` with text pairs

### Integration Tests
Test full workflows:
- Upload transcript → analyze → compare
- Risk detection with various severity levels
- Error handling with invalid sessions

### Manual Testing
1. Create test session with transcript
2. POST to `/api/sessions/:id/analyze`
3. Verify AIAnalysis and RiskFlag records created
4. GET from `/api/sessions/:id/compare`
5. Review alignment statistics

## Performance Considerations

1. **API Latency**: GPT-4 responses typically take 5-15 seconds
2. **Cost**: ~$0.10-0.30 per analysis (depending on transcript length)
3. **Rate Limits**: OpenAI allows 500 requests/day on free tier, more on paid
4. **Caching**: Consider caching analysis results (already done via database)
5. **Concurrent Requests**: Service handles multiple sessions independently

## Cost Estimation

Based on GPT-4 Turbo pricing (as of 2024):
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

Typical session analysis:
- Transcript: ~2,000 tokens input
- Analysis: ~500 tokens output
- **Cost per analysis**: ~$0.035

Risk detection:
- Transcript: ~2,000 tokens input
- Risk analysis: ~200 tokens output
- **Cost per risk scan**: ~$0.026

**Total per session**: ~$0.06

## Monitoring and Logging

All services include console logging:
- Analysis start/completion
- Risk detection results
- Error details for debugging
- API response times (implicit in logs)

Recommended monitoring:
- Track analysis success/failure rate
- Monitor average response time
- Alert on HIGH severity risk flags
- Track API costs via OpenAI dashboard

## Future Enhancements

Potential improvements:
1. **Streaming Responses**: Use OpenAI streaming for real-time updates
2. **Fine-tuning**: Train custom model on clinical documentation
3. **Multi-language Support**: Analyze transcripts in other languages
4. **Progress Notes**: Auto-generate SOAP notes
5. **Outcome Tracking**: Correlate AI suggestions with client outcomes

## Troubleshooting

### "Empty response from OpenAI"
- Check API key is valid
- Verify OpenAI service status
- Review rate limits

### "Validation failed"
- GPT-4 returned unexpected JSON structure
- Check rawOutput field in AIAnalysis for actual response
- May need to adjust Zod schemas

### "Analysis already exists"
- Delete existing AIAnalysis record to re-analyze
- Or create new session for revised transcript

### "Failed after 3 attempts"
- Network connectivity issue
- OpenAI API outage
- Check error logs for specific failure reason

## Support

For issues or questions:
1. Check error logs in console
2. Review OpenAI API status page
3. Verify environment variables are set
4. Ensure Prisma client is generated
5. Check database connection

## License

This integration is part of the Tava Treatment Plan Generator project.

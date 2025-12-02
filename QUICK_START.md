# Quick Start Guide - OpenAI Integration

## Setup (One-time)

1. **Add OpenAI API Key to `.env`**
   ```bash
   OPENAI_API_KEY="sk-proj-your-key-here"
   ```

2. **Generate Prisma Client** (if not already done)
   ```bash
   npm run db:generate
   ```

3. **Push Database Schema** (if not already done)
   ```bash
   npm run db:push
   ```

4. **Test the Integration** (optional but recommended)
   ```bash
   npx tsx test-openai-integration.ts
   ```

## Usage Flow

### Step 1: Create a Session with Transcript
```bash
POST /api/sessions
{
  "clientId": "...",
  "sessionDate": "2025-12-01T10:00:00Z",
  "transcript": "Therapist: Hi, how are you?..."
}
```

### Step 2: Therapist Adds Impressions
```bash
POST /api/sessions/:id/impressions
{
  "concerns": [...],
  "themes": [...],
  "goals": [...],
  "riskObservations": {...},
  "strengths": [...]
}
```

### Step 3: Trigger AI Analysis
```bash
POST /api/sessions/:id/analyze
```

This automatically:
- Analyzes the transcript with GPT-4
- Detects safety risks
- Stores results in database
- Updates session status

### Step 4: Compare Results
```bash
GET /api/sessions/:id/compare
```

Returns comparison showing:
- Aligned items (both therapist and AI identified)
- AI-only suggestions
- Therapist-only observations
- Alignment statistics

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions/:id/analyze` | POST | Trigger AI analysis |
| `/api/sessions/:id/analyze` | GET | Get existing analysis |
| `/api/sessions/:id/compare` | GET | Compare therapist vs AI |

## Key Functions (Server-side)

```typescript
import { generateAnalysis, generateClientView, generateSessionSummary } from '@/services/openai'
import { detectRisks, scanForKeywords } from '@/services/safety'

// Analyze transcript
const analysis = await generateAnalysis(transcript)

// Detect risks
const risks = await detectRisks(transcript)

// Generate client-friendly version
const clientView = await generateClientView(therapistContent)

// Generate summaries
const { therapistSummary, clientSummary } = await generateSessionSummary(transcript)
```

## Response Examples

### Analysis Response
```json
{
  "concerns": [
    {
      "text": "Work-related stress and burnout",
      "severity": "MODERATE",
      "excerpts": [...]
    }
  ],
  "themes": ["Overwhelm", "Self-care deficit"],
  "goals": [
    {
      "text": "Develop stress management techniques",
      "timeline": "short-term"
    }
  ],
  "interventions": [
    {
      "name": "Cognitive-Behavioral Therapy",
      "rationale": "Address negative thought patterns"
    }
  ],
  "homework": [...],
  "strengths": [...],
  "riskIndicators": [...]
}
```

### Comparison Response
```json
{
  "comparison": {
    "concerns": [
      {
        "therapist": {...},
        "ai": {...},
        "alignment": "aligned"
      }
    ]
  },
  "stats": {
    "overallAlignment": 75,
    "concerns": {
      "aligned": 5,
      "aiOnly": 2,
      "therapistOnly": 1
    }
  }
}
```

## Troubleshooting

### "OPENAI_API_KEY not found"
- Add to `.env` file
- Restart dev server

### "Empty response from OpenAI"
- Check API key is valid
- Verify you have API credits
- Check OpenAI status page

### "Prisma Client not found"
- Run `npm run db:generate`

### "Analysis already exists"
- Normal if re-analyzing
- Use GET endpoint instead

## Files Created

```
/src/services/
  ├── openai.ts          # GPT-4 integration
  └── safety.ts          # Risk detection

/src/app/api/sessions/[id]/
  ├── analyze/route.ts   # Analysis endpoint
  └── compare/route.ts   # Comparison endpoint

/OPENAI_INTEGRATION.md   # Full documentation
/test-openai-integration.ts  # Test suite
```

## Cost per Session

Approximate costs using GPT-4 Turbo:
- Analysis: ~$0.035
- Risk detection: ~$0.026
- **Total: ~$0.06 per session**

## Next Steps

1. Start dev server: `npm run dev`
2. Create test session via API
3. Upload transcript
4. Add therapist impressions
5. Trigger AI analysis
6. Review comparison results

For detailed documentation, see `OPENAI_INTEGRATION.md`

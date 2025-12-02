import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Risk keywords organized by category
export const RISK_KEYWORDS = {
  suicidalIdeation: [
    'kill myself',
    'end my life',
    'suicide',
    'suicidal',
    'want to die',
    'better off dead',
    'no reason to live',
    'not worth living',
    'take my own life',
    'end it all',
  ],
  selfHarm: [
    'cut myself',
    'hurt myself',
    'self-harm',
    'self harm',
    'cutting',
    'burning myself',
    'harm my body',
  ],
  harmToOthers: [
    'hurt someone',
    'kill someone',
    'harm others',
    'violent thoughts',
    'want to hurt',
    'attack',
    'make them pay',
  ],
  substanceCrisis: [
    'overdose',
    'using again',
    'relapse',
    'can\'t stop drinking',
    'can\'t stop using',
    'too much',
    'blackout',
  ],
} as const

export type RiskType = keyof typeof RISK_KEYWORDS

export interface KeywordMatch {
  type: RiskType
  keyword: string
  excerpt: string
  position: number
}

export interface RiskDetection {
  type: string
  severity: 'LOW' | 'MODERATE' | 'HIGH'
  excerpt: string
  keyword?: string
}

/**
 * Fast first-pass keyword scan for immediate risk detection
 * Returns matches with context
 */
export function scanForKeywords(transcript: string): KeywordMatch[] {
  const lowerTranscript = transcript.toLowerCase()
  const matches: KeywordMatch[] = []

  // Scan for each risk category
  for (const [riskType, keywords] of Object.entries(RISK_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      let position = 0

      // Find all occurrences of this keyword
      while (true) {
        position = lowerTranscript.indexOf(keywordLower, position)

        if (position === -1) break

        // Extract context around the keyword (100 chars before and after)
        const start = Math.max(0, position - 100)
        const end = Math.min(transcript.length, position + keyword.length + 100)
        const excerpt = transcript.slice(start, end).trim()

        matches.push({
          type: riskType as RiskType,
          keyword,
          excerpt: excerpt.length < transcript.length ? `...${excerpt}...` : excerpt,
          position,
        })

        position += keyword.length
      }
    }
  }

  // Sort by position in transcript
  return matches.sort((a, b) => a.position - b.position)
}

/**
 * Use GPT-4 for contextual risk analysis
 * This catches nuanced expressions of risk that keyword matching might miss
 */
async function analyzeRiskContext(
  transcript: string,
  keywordMatches: KeywordMatch[]
): Promise<RiskDetection[]> {
  const systemPrompt = `You are a clinical risk assessment specialist. Analyze the provided therapy transcript for safety concerns.

Your task is to:
1. Identify expressions of risk (suicidal ideation, self-harm, harm to others, substance crisis)
2. Assess the severity and immediacy of each risk
3. Consider context - distinguish between:
   - Current intent vs. past history
   - Active plans vs. passive thoughts
   - Immediate danger vs. general distress

Use these severity levels:
- LOW: Past history, fleeting thoughts, no current plan or intent
- MODERATE: Current thoughts, some planning, but ambivalent or has protective factors
- HIGH: Current intent, specific plan, imminent danger, lacks protective factors

IMPORTANT: Be clinically rigorous. Not every mention of distress is a safety risk.

Respond with valid JSON array:
[
  {
    "type": "suicidal ideation|self-harm|harm to others|substance crisis",
    "severity": "LOW|MODERATE|HIGH",
    "excerpt": "Direct quote from transcript",
    "reasoning": "Brief clinical rationale"
  }
]

If no significant risks are identified, return an empty array: []`

  const keywordSummary =
    keywordMatches.length > 0
      ? `\n\nKeyword matches found:\n${keywordMatches
          .map((m) => `- "${m.keyword}" in context: ${m.excerpt}`)
          .join('\n')}`
      : '\n\nNo risk keywords detected in initial scan.'

  const userPrompt = `Analyze this therapy session transcript for safety risks:

${transcript}${keywordSummary}

Provide a structured risk assessment with severity ratings.
Respond with valid JSON only.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.2, // Lower temperature for more consistent risk assessment
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    const parsedResponse = JSON.parse(content)

    // Handle both array and object responses
    let risks: any[] = []
    if (Array.isArray(parsedResponse)) {
      risks = parsedResponse
    } else if (parsedResponse.risks && Array.isArray(parsedResponse.risks)) {
      risks = parsedResponse.risks
    }

    // Validate and format each risk
    return risks.map((risk) => ({
      type: risk.type || 'unknown',
      severity: risk.severity || 'MODERATE',
      excerpt: risk.excerpt || '',
      keyword: undefined, // AI-detected risks don't have specific keywords
    }))
  } catch (error) {
    console.error('Error in GPT-4 risk analysis:', error)
    // Don't throw - fall back to keyword matches if AI analysis fails
    return []
  }
}

/**
 * Comprehensive risk detection combining keyword scan and AI analysis
 * Returns deduplicated list of risk detections
 */
export async function detectRisks(transcript: string): Promise<RiskDetection[]> {
  // Step 1: Fast keyword scan
  const keywordMatches = scanForKeywords(transcript)

  // Step 2: AI contextual analysis
  const aiRisks = await analyzeRiskContext(transcript, keywordMatches)

  // Step 3: Convert keyword matches to risk detections
  const keywordRisks: RiskDetection[] = keywordMatches.map((match) => ({
    type: match.type,
    severity: 'MODERATE' as const, // Default severity for keyword matches
    excerpt: match.excerpt,
    keyword: match.keyword,
  }))

  // Step 4: Merge and deduplicate
  // Prefer AI analysis for severity assessment when available
  const allRisks = [...aiRisks, ...keywordRisks]

  // Deduplicate based on excerpt similarity
  const uniqueRisks: RiskDetection[] = []
  const seenExcerpts = new Set<string>()

  for (const risk of allRisks) {
    // Normalize excerpt for comparison (first 50 chars)
    const normalizedExcerpt = risk.excerpt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 50)

    if (!seenExcerpts.has(normalizedExcerpt)) {
      seenExcerpts.add(normalizedExcerpt)
      uniqueRisks.push(risk)
    }
  }

  // Sort by severity (HIGH -> MODERATE -> LOW)
  const severityOrder = { HIGH: 0, MODERATE: 1, LOW: 2 }
  uniqueRisks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return uniqueRisks
}

/**
 * Quick check if transcript contains any risk keywords
 * Useful for immediate flagging before full analysis
 */
export function hasRiskKeywords(transcript: string): boolean {
  const matches = scanForKeywords(transcript)
  return matches.length > 0
}

/**
 * Get risk summary statistics
 */
export function getRiskSummary(risks: RiskDetection[]): {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  highestSeverity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH'
} {
  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0 }

  for (const risk of risks) {
    byType[risk.type] = (byType[risk.type] || 0) + 1
    bySeverity[risk.severity] = (bySeverity[risk.severity] || 0) + 1
  }

  let highestSeverity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' = 'NONE'
  if (bySeverity.HIGH > 0) {
    highestSeverity = 'HIGH'
  } else if (bySeverity.MODERATE > 0) {
    highestSeverity = 'MODERATE'
  } else if (bySeverity.LOW > 0) {
    highestSeverity = 'LOW'
  }

  return {
    total: risks.length,
    byType,
    bySeverity,
    highestSeverity,
  }
}

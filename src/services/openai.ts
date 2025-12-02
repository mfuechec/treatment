import OpenAI from 'openai'
import { z } from 'zod'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Validation schemas for AI responses
const excerptSchema = z.object({
  text: z.string(),
  timestamp: z.string().optional(),
})

const concernSchema = z.object({
  text: z.string(),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH']),
  excerpts: z.array(excerptSchema).optional(),
})

const goalSchema = z.object({
  text: z.string(),
  timeline: z.string().optional(),
  excerpts: z.array(excerptSchema).optional(),
})

const interventionSchema = z.object({
  name: z.string(),
  rationale: z.string(),
})

const homeworkSchema = z.object({
  task: z.string(),
  rationale: z.string(),
})

const strengthSchema = z.object({
  text: z.string(),
  excerpts: z.array(excerptSchema).optional(),
})

const riskIndicatorSchema = z.object({
  type: z.string(),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH']),
  excerpt: z.string(),
})

const analysisResponseSchema = z.object({
  concerns: z.array(concernSchema),
  themes: z.array(z.string()),
  goals: z.array(goalSchema),
  interventions: z.array(interventionSchema),
  homework: z.array(homeworkSchema),
  strengths: z.array(strengthSchema),
  riskIndicators: z.array(riskIndicatorSchema),
})

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>

// Client view schema
const clientViewSchema = z.object({
  summary: z.string(),
  yourGoals: z.array(z.string()),
  whatWeAreDoing: z.array(z.string()),
  yourHomework: z.array(z.string()),
  yourStrengths: z.array(z.string()),
  nextTime: z.string(),
})

export type ClientView = z.infer<typeof clientViewSchema>

// Session summary schema
const sessionSummarySchema = z.object({
  therapistSummary: z.string(),
  clientSummary: z.string(),
})

export type SessionSummary = z.infer<typeof sessionSummarySchema>

/**
 * Generate clinical analysis from session transcript using GPT-4
 * Includes retry logic for robustness
 */
export async function generateAnalysis(
  transcript: string,
  maxRetries = 3
): Promise<AnalysisResponse> {
  const systemPrompt = `You are a clinical documentation assistant for mental health professionals. Your role is to analyze therapy session transcripts and extract structured clinical information.

IMPORTANT GUIDELINES:
1. Extract only information explicitly present in the transcript
2. Do not infer or assume information not stated
3. Use clinical terminology appropriate for professional documentation
4. For severity ratings, use: LOW, MODERATE, or HIGH
5. Include relevant excerpts from the transcript to support your analysis
6. Be comprehensive but concise

Your response must be valid JSON with this exact structure:
{
  "concerns": [
    {
      "text": "Description of clinical concern",
      "severity": "LOW|MODERATE|HIGH",
      "excerpts": [{"text": "relevant quote", "timestamp": "optional"}]
    }
  ],
  "themes": ["theme1", "theme2"],
  "goals": [
    {
      "text": "Treatment goal",
      "timeline": "short-term|medium-term|long-term",
      "excerpts": [{"text": "relevant quote"}]
    }
  ],
  "interventions": [
    {
      "name": "Intervention name (e.g., CBT, mindfulness)",
      "rationale": "Why this intervention is recommended"
    }
  ],
  "homework": [
    {
      "task": "Specific homework assignment",
      "rationale": "Purpose and expected benefit"
    }
  ],
  "strengths": [
    {
      "text": "Client strength or resource",
      "excerpts": [{"text": "supporting evidence"}]
    }
  ],
  "riskIndicators": [
    {
      "type": "suicidal ideation|self-harm|harm to others|substance crisis",
      "severity": "LOW|MODERATE|HIGH",
      "excerpt": "Exact quote indicating risk"
    }
  ]
}`

  const userPrompt = `Analyze this therapy session transcript and provide structured clinical documentation:

${transcript}

Remember to:
- Extract concerns with severity ratings
- Identify recurring themes
- Suggest treatment goals with timelines
- Recommend evidence-based interventions
- Propose relevant homework assignments
- Highlight client strengths
- Flag any risk indicators

Respond with valid JSON only.`

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
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

      // Parse JSON response
      const parsedResponse = JSON.parse(content)

      // Validate response structure
      const validatedResponse = analysisResponseSchema.parse(parsedResponse)

      return validatedResponse
    } catch (error) {
      lastError = error as Error
      console.error(
        `Analysis attempt ${attempt}/${maxRetries} failed:`,
        error
      )

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Failed to generate analysis after ${maxRetries} attempts: ${lastError?.message}`
  )
}

/**
 * Generate client-friendly view from therapist clinical content
 * Transforms technical language to 8th grade reading level
 */
export async function generateClientView(
  therapistContent: {
    concerns: any[]
    themes: string[]
    goals: any[]
    interventions: any[]
    homework: any[]
    strengths: any[]
  }
): Promise<ClientView> {
  const systemPrompt = `You are a mental health communication specialist. Your role is to translate clinical documentation into clear, supportive, client-friendly language.

GUIDELINES:
1. Write at an 8th grade reading level
2. Use warm, encouraging, non-clinical language
3. Focus on collaboration and empowerment
4. Avoid jargon and technical terms
5. Be honest but hopeful
6. Use "we" language to emphasize partnership

Your response must be valid JSON with this structure:
{
  "summary": "Brief overview of session in friendly language",
  "yourGoals": ["Goal 1 in plain language", "Goal 2"],
  "whatWeAreDoing": ["Intervention 1 explained simply", "Intervention 2"],
  "yourHomework": ["Homework 1 in encouraging tone", "Homework 2"],
  "yourStrengths": ["Strength 1", "Strength 2"],
  "nextTime": "What to expect in next session"
}`

  const userPrompt = `Transform this clinical documentation into a client-friendly treatment plan summary:

Concerns: ${JSON.stringify(therapistContent.concerns)}
Themes: ${JSON.stringify(therapistContent.themes)}
Goals: ${JSON.stringify(therapistContent.goals)}
Interventions: ${JSON.stringify(therapistContent.interventions)}
Homework: ${JSON.stringify(therapistContent.homework)}
Strengths: ${JSON.stringify(therapistContent.strengths)}

Create a warm, clear, encouraging summary that helps the client understand:
- What we talked about
- What we're working toward together
- How we'll get there
- What they can practice
- Their positive qualities and progress

Respond with valid JSON only.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
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
    const validatedResponse = clientViewSchema.parse(parsedResponse)

    return validatedResponse
  } catch (error) {
    console.error('Error generating client view:', error)
    throw new Error(`Failed to generate client view: ${(error as Error).message}`)
  }
}

/**
 * Generate session summaries for both therapist and client
 */
export async function generateSessionSummary(
  transcript: string
): Promise<SessionSummary> {
  const systemPrompt = `You are a clinical documentation assistant. Generate two summaries of this therapy session:

1. Therapist Summary: Professional, detailed, clinical language (2-3 paragraphs)
2. Client Summary: Warm, encouraging, plain language suitable for 8th grade reading level (1-2 paragraphs)

Your response must be valid JSON:
{
  "therapistSummary": "Professional summary with clinical details...",
  "clientSummary": "Friendly, accessible summary for client..."
}`

  const userPrompt = `Generate therapist and client summaries for this session:

${transcript}

Therapist summary should include:
- Key topics discussed
- Clinical observations
- Progress noted
- Areas for continued focus

Client summary should:
- Highlight what was accomplished
- Use encouraging, supportive language
- Be clear and easy to understand
- Focus on collaboration and progress

Respond with valid JSON only.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.4,
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
    const validatedResponse = sessionSummarySchema.parse(parsedResponse)

    return validatedResponse
  } catch (error) {
    console.error('Error generating session summary:', error)
    throw new Error(`Failed to generate session summary: ${(error as Error).message}`)
  }
}

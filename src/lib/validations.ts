import { z } from "zod"

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.enum(["THERAPIST", "CLIENT"], {
    required_error: "Please select a role",
  }),
  // Therapist-specific fields (optional)
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  // Client-specific fields
  displayName: z.string().optional(),
  therapistId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

export const createSessionSchema = z.object({
  clientId: z.string().cuid("Invalid client ID"),
  therapistId: z.string().cuid("Invalid therapist ID"),
  sessionDate: z
    .string()
    .datetime("Invalid date format")
    .or(z.date())
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
  transcript: z
    .string()
    .min(100, "Transcript must be at least 100 characters")
    .max(100000, "Transcript is too long (max 100,000 characters)"),
})

export const updateSessionStatusSchema = z.object({
  status: z.enum([
    "TRANSCRIPT_UPLOADED",
    "IMPRESSIONS_COMPLETE",
    "AI_ANALYZED",
    "COMPARISON_READY",
    "PLAN_MERGED",
  ]),
})

// ============================================================================
// THERAPIST IMPRESSIONS SCHEMAS
// ============================================================================

// Concern schema
const concernSchema = z.object({
  text: z.string().min(1, "Concern text is required"),
  severity: z.enum(["LOW", "MODERATE", "HIGH"], {
    required_error: "Severity is required",
  }),
  excerptIds: z.array(z.string()).optional().default([]),
})

// Highlight schema
const highlightSchema = z.object({
  excerpt: z.string().min(1, "Excerpt is required"),
  timestamp: z.string().optional(),
  note: z.string().optional(),
})

// Goal schema
const goalSchema = z.object({
  text: z.string().min(1, "Goal text is required"),
  timeline: z.string().optional(),
  excerptIds: z.array(z.string()).optional().default([]),
})

// Diagnosis schema
const diagnosisSchema = z.object({
  code: z.string().min(1, "Diagnosis code is required"),
  description: z.string().min(1, "Diagnosis description is required"),
})

// Strength schema
const strengthSchema = z.object({
  text: z.string().min(1, "Strength text is required"),
  excerptIds: z.array(z.string()).optional().default([]),
})

// Risk observations schema
const riskObservationsSchema = z.object({
  level: z.enum(["NONE", "LOW", "MODERATE", "HIGH"], {
    required_error: "Risk level is required",
  }),
  notes: z.string().optional(),
  excerptIds: z.array(z.string()).optional().default([]),
})

// Session quality schema
const sessionQualitySchema = z.object({
  rapport: z
    .number()
    .min(1, "Rapport rating must be between 1 and 5")
    .max(5, "Rapport rating must be between 1 and 5")
    .optional(),
  engagement: z
    .number()
    .min(1, "Engagement rating must be between 1 and 5")
    .max(5, "Engagement rating must be between 1 and 5")
    .optional(),
  resistance: z
    .number()
    .min(1, "Resistance rating must be between 1 and 5")
    .max(5, "Resistance rating must be between 1 and 5")
    .optional(),
  notes: z.string().optional(),
})

// Main therapist impressions schema
export const therapistImpressionsSchema = z.object({
  sessionId: z.string().cuid("Invalid session ID"),
  concerns: z
    .array(concernSchema)
    .min(1, "At least one concern is required")
    .max(20, "Maximum 20 concerns allowed"),
  highlights: z
    .array(highlightSchema)
    .max(15, "Maximum 15 highlights allowed")
    .optional()
    .default([]),
  themes: z
    .array(z.string().min(1, "Theme cannot be empty"))
    .min(1, "At least one theme is required")
    .max(10, "Maximum 10 themes allowed"),
  goals: z
    .array(goalSchema)
    .min(1, "At least one goal is required")
    .max(10, "Maximum 10 goals allowed"),
  diagnoses: z
    .array(diagnosisSchema)
    .max(5, "Maximum 5 diagnoses allowed")
    .optional(),
  modalities: z
    .array(z.string().min(1, "Modality cannot be empty"))
    .max(10, "Maximum 10 modalities allowed")
    .optional(),
  riskObservations: riskObservationsSchema,
  strengths: z
    .array(strengthSchema)
    .max(10, "Maximum 10 strengths allowed")
    .optional()
    .default([]),
  sessionQuality: sessionQualitySchema.optional(),
})

export const updateTherapistImpressionsSchema = therapistImpressionsSchema.omit({
  sessionId: true,
})

// ============================================================================
// AI ANALYSIS SCHEMAS
// ============================================================================

const aiConcernSchema = z.object({
  text: z.string(),
  severity: z.enum(["LOW", "MODERATE", "HIGH"]),
  excerptIds: z.array(z.string()).optional().default([]),
})

const aiGoalSchema = z.object({
  text: z.string(),
  timeline: z.string().optional(),
  excerptIds: z.array(z.string()).optional().default([]),
})

const interventionSchema = z.object({
  name: z.string(),
  rationale: z.string(),
})

const homeworkSchema = z.object({
  task: z.string(),
  rationale: z.string(),
})

const aiStrengthSchema = z.object({
  text: z.string(),
  excerptIds: z.array(z.string()).optional().default([]),
})

const riskIndicatorSchema = z.object({
  type: z.string(),
  severity: z.enum(["NONE", "LOW", "MODERATE", "HIGH"]),
  excerpt: z.string(),
})

export const aiAnalysisSchema = z.object({
  sessionId: z.string().cuid("Invalid session ID"),
  concerns: z.array(aiConcernSchema),
  themes: z.array(z.string()),
  goals: z.array(aiGoalSchema),
  interventions: z.array(interventionSchema),
  homework: z.array(homeworkSchema),
  strengths: z.array(aiStrengthSchema),
  riskIndicators: z.array(riskIndicatorSchema),
  rawOutput: z.any(), // Store full GPT response for debugging
})

// ============================================================================
// TREATMENT PLAN SCHEMAS
// ============================================================================

export const treatmentPlanContentSchema = z.object({
  diagnoses: z.array(diagnosisSchema).optional(),
  primaryConcerns: z.array(z.string()),
  treatmentGoals: z.array(goalSchema),
  interventions: z.array(interventionSchema),
  modalities: z.array(z.string()),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  riskAssessment: riskObservationsSchema.optional(),
  strengths: z.array(strengthSchema).optional(),
  homework: z.array(homeworkSchema).optional(),
  progressMetrics: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const createTreatmentPlanSchema = z.object({
  clientId: z.string().cuid("Invalid client ID"),
  sourceSessionId: z.string().cuid("Invalid session ID"),
  therapistContent: treatmentPlanContentSchema,
})

export const updateTreatmentPlanSchema = z.object({
  therapistContent: treatmentPlanContentSchema.optional(),
  clientContent: z.any().optional(), // Plain-language version
  status: z.enum(["DRAFT", "APPROVED"]).optional(),
})

export const approveTreatmentPlanSchema = z.object({
  versionId: z.string().cuid("Invalid version ID"),
})

// ============================================================================
// RISK FLAG SCHEMAS
// ============================================================================

export const createRiskFlagSchema = z.object({
  sessionId: z.string().cuid("Invalid session ID"),
  riskType: z.enum(
    ["SI", "SELF_HARM", "HARM_TO_OTHERS", "SUBSTANCE", "ESCALATION"],
    {
      required_error: "Risk type is required",
    }
  ),
  severity: z.enum(["NONE", "LOW", "MODERATE", "HIGH"], {
    required_error: "Severity is required",
  }),
  excerpt: z.string().min(1, "Excerpt is required"),
})

export const acknowledgeRiskFlagSchema = z.object({
  flagId: z.string().cuid("Invalid flag ID"),
})

// ============================================================================
// SESSION SUMMARY SCHEMAS
// ============================================================================

export const createSessionSummarySchema = z.object({
  sessionId: z.string().cuid("Invalid session ID"),
  therapistSummary: z
    .string()
    .min(50, "Summary must be at least 50 characters")
    .max(5000, "Summary is too long (max 5,000 characters)"),
  clientSummary: z
    .string()
    .min(50, "Client summary must be at least 50 characters")
    .max(2000, "Client summary is too long (max 2,000 characters)")
    .optional(),
})

// ============================================================================
// CLIENT MANAGEMENT SCHEMAS
// ============================================================================

export const createClientSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name is too long"),
  therapistId: z.string().cuid("Invalid therapist ID"),
})

export const updateClientSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name is too long")
    .optional(),
})

// ============================================================================
// THERAPIST MANAGEMENT SCHEMAS
// ============================================================================

export const updateTherapistProfileSchema = z.object({
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  preferences: z.any().optional(), // JSON object for therapist preferences
})

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
})

export const sessionFilterSchema = z.object({
  clientId: z.string().cuid().optional(),
  therapistId: z.string().cuid().optional(),
  status: z
    .enum([
      "TRANSCRIPT_UPLOADED",
      "IMPRESSIONS_COMPLETE",
      "AI_ANALYZED",
      "COMPARISON_READY",
      "PLAN_MERGED",
    ])
    .optional(),
  startDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
})

// ============================================================================
// TYPE EXPORTS (for TypeScript usage)
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type TherapistImpressionsInput = z.infer<typeof therapistImpressionsSchema>
export type UpdateTherapistImpressionsInput = z.infer<typeof updateTherapistImpressionsSchema>
export type AIAnalysisInput = z.infer<typeof aiAnalysisSchema>
export type TreatmentPlanContent = z.infer<typeof treatmentPlanContentSchema>
export type CreateTreatmentPlanInput = z.infer<typeof createTreatmentPlanSchema>
export type UpdateTreatmentPlanInput = z.infer<typeof updateTreatmentPlanSchema>
export type CreateRiskFlagInput = z.infer<typeof createRiskFlagSchema>
export type CreateSessionSummaryInput = z.infer<typeof createSessionSummarySchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type UpdateTherapistProfileInput = z.infer<typeof updateTherapistProfileSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type SessionFilterInput = z.infer<typeof sessionFilterSchema>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates data against a schema and returns typed result
 * @throws ZodError if validation fails
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data)
}

/**
 * Safely validates data and returns success/error result
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Formats Zod errors for API responses
 */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const path = issue.path.join(".")
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }
  return formatted
}

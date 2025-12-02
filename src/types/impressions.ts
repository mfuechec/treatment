/**
 * Shared types for therapist impressions
 * Used by both API validation and form components
 */

// Severity levels - using lowercase for consistency across the app
export type Severity = 'low' | 'moderate' | 'high'

// Risk levels - including 'none' option
export type RiskLevel = 'none' | 'low' | 'moderate' | 'high'

// Concern structure
export interface Concern {
  text: string
  severity: Severity
  excerptIds?: string[]
}

// Highlight structure
export interface Highlight {
  excerpt: string
  timestamp?: string
  note?: string
}

// Goal structure
export interface Goal {
  text: string
  timeline?: string
  excerptIds?: string[]
}

// Diagnosis structure
export interface Diagnosis {
  code: string
  description: string
}

// Risk observation structure
export interface RiskObservation {
  level: RiskLevel
  notes?: string
  excerptIds?: string[]
}

// Strength structure
export interface Strength {
  text: string
  excerptIds?: string[]
}

// Session quality structure
export interface SessionQuality {
  rapport?: number
  engagement?: number
  resistance?: number
  notes?: string
}

// Complete impressions data structure
export interface ImpressionsData {
  concerns: Concern[]
  highlights: Highlight[]
  themes: string[]
  goals: Goal[]
  diagnoses?: Diagnosis[]
  modalities?: string[]
  riskObservations: RiskObservation
  strengths: Strength[]
  sessionQuality?: SessionQuality
}

// Form-specific types (for UI state management)
export interface FormConcern {
  id: string
  text: string
  severity: Severity
  excerpts: string[]
}

export interface FormHighlight {
  id: string
  excerpt: string
  note: string
}

export interface FormGoal {
  id: string
  text: string
  timeline: 'short' | 'long'
}

export interface FormStrength {
  id: string
  text: string
  evidence: string
}

// Helper to convert form data to API format
export function formToApiData(formData: {
  concerns: FormConcern[]
  highlights: FormHighlight[]
  themes: string[]
  goals: FormGoal[]
  diagnosticCodes: string[]
  modalities: string[]
  riskLevel: string
  riskNotes: string
  strengths: FormStrength[]
  sessionQuality: SessionQuality
}): ImpressionsData {
  return {
    concerns: formData.concerns.map((c) => ({
      text: c.text,
      severity: c.severity,
      excerptIds: c.excerpts,
    })),
    highlights: formData.highlights.map((h) => ({
      excerpt: h.excerpt,
      note: h.note || undefined,
    })),
    themes: formData.themes,
    goals: formData.goals.map((g) => ({
      text: g.text,
      timeline: g.timeline === 'short' ? 'short-term' : 'long-term',
    })),
    diagnoses: formData.diagnosticCodes.length > 0
      ? formData.diagnosticCodes.map((code) => {
          const parts = code.split(' ')
          return {
            code: parts[0] || code,
            description: parts.slice(1).join(' ') || code,
          }
        })
      : undefined,
    modalities: formData.modalities.length > 0 ? formData.modalities : undefined,
    riskObservations: {
      level: (formData.riskLevel || 'none') as RiskLevel,
      notes: formData.riskNotes || undefined,
      excerptIds: [],
    },
    strengths: formData.strengths.map((s) => ({
      text: s.text,
      excerptIds: [],
    })),
    sessionQuality: formData.sessionQuality,
  }
}

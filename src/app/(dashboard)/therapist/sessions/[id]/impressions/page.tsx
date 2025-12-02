"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  Loader2,
  Plus,
  X,
  Save,
  Send,
  Calendar,
  User,
  FileText,
  Sparkles,
} from "lucide-react"

interface Session {
  id: string
  sessionDate: string
  client: {
    displayName: string
    user: {
      email: string
    }
  }
}

interface Concern {
  id: string
  description: string
  severity: "mild" | "moderate" | "severe"
  excerpts: string[]
}

interface Highlight {
  id: string
  excerpt: string
  note: string
}

interface Goal {
  id: string
  description: string
  timeline: "short" | "long"
}

interface Strength {
  id: string
  description: string
  evidence: string
}

export default function TherapistImpressionsPage(
  props: PageProps<"/therapist/sessions/[id]/impressions">
) {
  const { id } = use(props.params)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [observedThemes, setObservedThemes] = useState<string[]>([])
  const [customThemes, setCustomThemes] = useState<string[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [diagnosticCodes, setDiagnosticCodes] = useState<string[]>([])
  const [modalities, setModalities] = useState<string[]>([])
  const [riskLevel, setRiskLevel] = useState<string>("")
  const [riskEvidence, setRiskEvidence] = useState("")
  const [strengths, setStrengths] = useState<Strength[]>([])
  const [rapportRating, setRapportRating] = useState<number>(3)
  const [engagementRating, setEngagementRating] = useState<number>(3)
  const [resistanceRating, setResistanceRating] = useState<number>(3)
  const [sessionNotes, setSessionNotes] = useState("")

  // New concern/highlight/goal form states
  const [newConcern, setNewConcern] = useState<{ description: string; severity: "mild" | "moderate" | "severe"; excerpt: string }>({ description: "", severity: "moderate", excerpt: "" })
  const [newHighlight, setNewHighlight] = useState({ excerpt: "", note: "" })
  const [newGoal, setNewGoal] = useState<{ description: string; timeline: "short" | "long" }>({ description: "", timeline: "short" })
  const [newDiagnosticCode, setNewDiagnosticCode] = useState("")
  const [newCustomTheme, setNewCustomTheme] = useState("")
  const [newStrength, setNewStrength] = useState({ description: "", evidence: "" })

  const commonThemes = [
    "Anxiety",
    "Depression",
    "Relationship Issues",
    "Trauma",
    "Self-Esteem",
    "Work Stress",
    "Family Conflict",
    "Grief/Loss",
    "Substance Use",
    "Life Transitions",
  ]

  const modalityOptions = [
    "CBT (Cognitive Behavioral Therapy)",
    "ACT (Acceptance and Commitment Therapy)",
    "DBT (Dialectical Behavior Therapy)",
    "Psychodynamic Therapy",
    "Solution-Focused Brief Therapy",
    "Motivational Interviewing",
    "Mindfulness-Based Therapy",
    "EMDR",
    "Narrative Therapy",
  ]

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${id}`)
        if (!response.ok) throw new Error("Failed to load session")
        const data = await response.json()
        setSession(data.session)
      } catch (err) {
        setError("Failed to load session details")
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [id])

  const addConcern = () => {
    if (!newConcern.description.trim()) return
    setConcerns([
      ...concerns,
      {
        id: Date.now().toString(),
        description: newConcern.description,
        severity: newConcern.severity,
        excerpts: newConcern.excerpt ? [newConcern.excerpt] : [],
      },
    ])
    setNewConcern({ description: "", severity: "moderate", excerpt: "" })
  }

  const removeConcern = (id: string) => {
    setConcerns(concerns.filter((c) => c.id !== id))
  }

  const addHighlight = () => {
    if (!newHighlight.excerpt.trim()) return
    setHighlights([
      ...highlights,
      {
        id: Date.now().toString(),
        excerpt: newHighlight.excerpt,
        note: newHighlight.note,
      },
    ])
    setNewHighlight({ excerpt: "", note: "" })
  }

  const removeHighlight = (id: string) => {
    setHighlights(highlights.filter((h) => h.id !== id))
  }

  const addGoal = () => {
    if (!newGoal.description.trim()) return
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        description: newGoal.description,
        timeline: newGoal.timeline,
      },
    ])
    setNewGoal({ description: "", timeline: "short" })
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const addDiagnosticCode = () => {
    if (!newDiagnosticCode.trim()) return
    setDiagnosticCodes([...diagnosticCodes, newDiagnosticCode])
    setNewDiagnosticCode("")
  }

  const removeDiagnosticCode = (code: string) => {
    setDiagnosticCodes(diagnosticCodes.filter((c) => c !== code))
  }

  const addCustomTheme = () => {
    if (!newCustomTheme.trim()) return
    setCustomThemes([...customThemes, newCustomTheme])
    setNewCustomTheme("")
  }

  const removeCustomTheme = (theme: string) => {
    setCustomThemes(customThemes.filter((t) => t !== theme))
  }

  const addStrength = () => {
    if (!newStrength.description.trim()) return
    setStrengths([
      ...strengths,
      {
        id: Date.now().toString(),
        description: newStrength.description,
        evidence: newStrength.evidence,
      },
    ])
    setNewStrength({ description: "", evidence: "" })
  }

  const removeStrength = (id: string) => {
    setStrengths(strengths.filter((s) => s.id !== id))
  }

  const toggleTheme = (theme: string) => {
    setObservedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    )
  }

  const toggleModality = (modality: string) => {
    setModalities((prev) =>
      prev.includes(modality) ? prev.filter((m) => m !== modality) : [...prev, modality]
    )
  }

  const buildImpressionsData = () => ({
    presentingConcerns: concerns,
    keyHighlights: highlights,
    observedThemes: [...observedThemes, ...customThemes],
    treatmentGoals: goals,
    diagnosticImpressions: diagnosticCodes,
    modalityConsiderations: modalities,
    riskAssessment: {
      level: riskLevel,
      evidence: riskEvidence,
    },
    clientStrengths: strengths,
    sessionQuality: {
      rapport: rapportRating,
      engagement: engagementRating,
      resistance: resistanceRating,
      notes: sessionNotes,
    },
  })

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    setError("")

    try {
      const response = await fetch(`/api/sessions/${id}/impressions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildImpressionsData(),
          status: "draft",
        }),
      })

      if (!response.ok) throw new Error("Failed to save draft")

      // Show success feedback
      alert("Draft saved successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft")
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Submit impressions
      const response = await fetch(`/api/sessions/${id}/impressions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildImpressionsData(),
          status: "submitted",
        }),
      })

      if (!response.ok) throw new Error("Failed to submit impressions")

      // Trigger AI analysis - the API endpoint will handle this
      // The response should include the session ID to redirect to
      const result = await response.json()

      // Redirect to session detail page where AI analysis results will be shown
      router.push(`/therapist/sessions/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit impressions")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!session) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Session not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapist Impressions</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {session.client.displayName || session.client.user.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(session.sessionDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PRESENTING CONCERNS */}
        <Card>
          <CardHeader>
            <CardTitle>Presenting Concerns</CardTitle>
            <CardDescription>
              Identify primary concerns with severity levels and supporting evidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {concerns.map((concern) => (
              <div
                key={concern.id}
                className="p-4 border rounded-lg bg-gray-50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          concern.severity === "severe"
                            ? "destructive"
                            : concern.severity === "moderate"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {concern.severity}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900">{concern.description}</p>
                    {concern.excerpts.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {concern.excerpts.map((excerpt, i) => (
                          <p key={i} className="italic">
                            "{excerpt}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConcern(concern.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
              <Input
                placeholder="Concern description"
                value={newConcern.description}
                onChange={(e) =>
                  setNewConcern({ ...newConcern, description: e.target.value })
                }
              />
              <Select
                value={newConcern.severity}
                onValueChange={(v: "mild" | "moderate" | "severe") =>
                  setNewConcern({ ...newConcern, severity: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Transcript excerpt (optional)"
                value={newConcern.excerpt}
                onChange={(e) =>
                  setNewConcern({ ...newConcern, excerpt: e.target.value })
                }
                className="min-h-[60px]"
              />
              <Button type="button" onClick={addConcern} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Concern
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KEY TRANSCRIPT HIGHLIGHTS */}
        <Card>
          <CardHeader>
            <CardTitle>Key Transcript Highlights</CardTitle>
            <CardDescription>
              Mark significant moments with context and notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="p-4 border rounded-lg bg-gray-50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm italic text-gray-700">"{highlight.excerpt}"</p>
                    {highlight.note && (
                      <p className="text-sm text-gray-600">Note: {highlight.note}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighlight(highlight.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
              <Textarea
                placeholder="Significant excerpt from transcript"
                value={newHighlight.excerpt}
                onChange={(e) =>
                  setNewHighlight({ ...newHighlight, excerpt: e.target.value })
                }
                className="min-h-[80px]"
              />
              <Textarea
                placeholder="Your notes about this moment (optional)"
                value={newHighlight.note}
                onChange={(e) =>
                  setNewHighlight({ ...newHighlight, note: e.target.value })
                }
                className="min-h-[60px]"
              />
              <Button type="button" onClick={addHighlight} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Highlight
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* OBSERVED THEMES */}
        <Card>
          <CardHeader>
            <CardTitle>Observed Themes</CardTitle>
            <CardDescription>
              Select common themes and add custom observations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {commonThemes.map((theme) => (
                <div key={theme} className="flex items-center space-x-2">
                  <Checkbox
                    id={theme}
                    checked={observedThemes.includes(theme)}
                    onCheckedChange={() => toggleTheme(theme)}
                  />
                  <Label htmlFor={theme} className="cursor-pointer">
                    {theme}
                  </Label>
                </div>
              ))}
            </div>

            {customThemes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Themes</Label>
                  <div className="flex flex-wrap gap-2">
                    {customThemes.map((theme) => (
                      <Badge key={theme} variant="secondary">
                        {theme}
                        <button
                          type="button"
                          onClick={() => removeCustomTheme(theme)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Add custom theme"
                value={newCustomTheme}
                onChange={(e) => setNewCustomTheme(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTheme())}
              />
              <Button type="button" onClick={addCustomTheme} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* INITIAL TREATMENT GOALS */}
        <Card>
          <CardHeader>
            <CardTitle>Initial Treatment Goals</CardTitle>
            <CardDescription>
              Define short-term and long-term therapeutic objectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 border rounded-lg bg-gray-50 flex items-start justify-between"
              >
                <div className="flex-1">
                  <Badge variant={goal.timeline === "short" ? "default" : "secondary"}>
                    {goal.timeline}-term
                  </Badge>
                  <p className="mt-2 text-gray-900">{goal.description}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGoal(goal.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
              <Textarea
                placeholder="Goal description"
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                className="min-h-[80px]"
              />
              <Select
                value={newGoal.timeline}
                onValueChange={(v: "short" | "long") =>
                  setNewGoal({ ...newGoal, timeline: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short-term</SelectItem>
                  <SelectItem value="long">Long-term</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addGoal} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* DIAGNOSTIC IMPRESSIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Impressions (Optional)</CardTitle>
            <CardDescription>
              Add ICD-10 codes or diagnostic considerations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnosticCodes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {diagnosticCodes.map((code) => (
                  <Badge key={code} variant="outline">
                    {code}
                    <button
                      type="button"
                      onClick={() => removeDiagnosticCode(code)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="e.g., F41.1 Generalized Anxiety Disorder"
                value={newDiagnosticCode}
                onChange={(e) => setNewDiagnosticCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDiagnosticCode())}
              />
              <Button type="button" onClick={addDiagnosticCode} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* MODALITY CONSIDERATIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Modality Considerations</CardTitle>
            <CardDescription>
              Select therapeutic approaches that may be beneficial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modalityOptions.map((modality) => (
                <div key={modality} className="flex items-center space-x-2">
                  <Checkbox
                    id={modality}
                    checked={modalities.includes(modality)}
                    onCheckedChange={() => toggleModality(modality)}
                  />
                  <Label htmlFor={modality} className="cursor-pointer">
                    {modality}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RISK OBSERVATIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Evaluate risk level and provide supporting evidence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Risk Level</Label>
              <RadioGroup value={riskLevel} onValueChange={setRiskLevel}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="risk-none" />
                  <Label htmlFor="risk-none" className="cursor-pointer">
                    No identified risk
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="risk-low" />
                  <Label htmlFor="risk-low" className="cursor-pointer">
                    Low risk
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="risk-moderate" />
                  <Label htmlFor="risk-moderate" className="cursor-pointer">
                    Moderate risk
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="risk-high" />
                  <Label htmlFor="risk-high" className="cursor-pointer">
                    High risk (immediate intervention needed)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {riskLevel && riskLevel !== "none" && (
              <div className="space-y-2">
                <Label>Evidence and Notes</Label>
                <Textarea
                  placeholder="Describe evidence, protective factors, and any immediate actions taken..."
                  value={riskEvidence}
                  onChange={(e) => setRiskEvidence(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* CLIENT STRENGTHS */}
        <Card>
          <CardHeader>
            <CardTitle>Client Strengths</CardTitle>
            <CardDescription>
              Identify positive attributes and protective factors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengths.map((strength) => (
              <div
                key={strength.id}
                className="p-4 border rounded-lg bg-gray-50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{strength.description}</p>
                    {strength.evidence && (
                      <p className="text-sm text-gray-600 mt-1">
                        Evidence: {strength.evidence}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStrength(strength.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
              <Input
                placeholder="Strength or protective factor"
                value={newStrength.description}
                onChange={(e) =>
                  setNewStrength({ ...newStrength, description: e.target.value })
                }
              />
              <Textarea
                placeholder="Supporting evidence (optional)"
                value={newStrength.evidence}
                onChange={(e) =>
                  setNewStrength({ ...newStrength, evidence: e.target.value })
                }
                className="min-h-[60px]"
              />
              <Button type="button" onClick={addStrength} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Strength
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SESSION QUALITY */}
        <Card>
          <CardHeader>
            <CardTitle>Session Quality Assessment</CardTitle>
            <CardDescription>
              Rate therapeutic alliance and engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Rapport</Label>
                  <span className="text-sm text-gray-600">{rapportRating}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rapportRating}
                  onChange={(e) => setRapportRating(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Client Engagement</Label>
                  <span className="text-sm text-gray-600">{engagementRating}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={engagementRating}
                  onChange={(e) => setEngagementRating(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Resistance</Label>
                  <span className="text-sm text-gray-600">{resistanceRating}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={resistanceRating}
                  onChange={(e) => setResistanceRating(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any additional observations about the session..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Treatment Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit & Generate Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

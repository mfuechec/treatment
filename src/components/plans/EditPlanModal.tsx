"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, X, Save } from "lucide-react"

interface EditPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  initialContent: any
}

export function EditPlanModal({ open, onOpenChange, planId, initialContent }: EditPlanModalProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // Form state - handle different data structures
  const [diagnosis, setDiagnosis] = useState("")
  const [frequency, setFrequency] = useState("")
  const [duration, setDuration] = useState("")
  const [presentingProblems, setPresentingProblems] = useState<string[]>([])
  const [treatmentGoals, setTreatmentGoals] = useState<Array<{goal: string, target: string, measurable: string}>>([])
  const [interventions, setInterventions] = useState<Array<{modality: string, frequency: string, techniques: string[]}>>([])
  const [strengths, setStrengths] = useState("")
  const [riskFactors, setRiskFactors] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Initialize form from initialContent
  useEffect(() => {
    if (initialContent) {
      // Diagnosis
      if (typeof initialContent.diagnosis === "string") {
        setDiagnosis(initialContent.diagnosis)
      } else if (initialContent.diagnosis?.primary) {
        setDiagnosis(initialContent.diagnosis.primary)
      }

      setFrequency(initialContent.frequency || "")
      setDuration(initialContent.duration || "")

      // Presenting problems
      if (Array.isArray(initialContent.presentingProblems)) {
        setPresentingProblems(initialContent.presentingProblems)
      } else if (Array.isArray(initialContent.concerns)) {
        setPresentingProblems(initialContent.concerns.map((c: any) => typeof c === "string" ? c : c.text))
      }

      // Treatment goals
      if (Array.isArray(initialContent.treatmentGoals)) {
        setTreatmentGoals(initialContent.treatmentGoals.map((g: any) => ({
          goal: g.goal || g.text || "",
          target: g.target || "",
          measurable: g.measurable || ""
        })))
      } else if (Array.isArray(initialContent.goals)) {
        setTreatmentGoals(initialContent.goals.map((g: any) => ({
          goal: typeof g === "string" ? g : g.text || "",
          target: "",
          measurable: ""
        })))
      }

      // Interventions
      if (Array.isArray(initialContent.interventions)) {
        setInterventions(initialContent.interventions.map((i: any) => ({
          modality: i.modality || i.name || "",
          frequency: i.frequency || "",
          techniques: Array.isArray(i.techniques) ? i.techniques : []
        })))
      }

      // Strengths
      if (typeof initialContent.strengths === "string") {
        setStrengths(initialContent.strengths)
      } else if (Array.isArray(initialContent.strengths)) {
        setStrengths(initialContent.strengths.join(", "))
      }

      setRiskFactors(initialContent.riskFactors || "")
      setAdditionalNotes(initialContent.additionalNotes || "")
    }
  }, [initialContent])

  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    try {
      const therapistContent = {
        diagnosis: {
          primary: diagnosis,
          specifiers: initialContent?.diagnosis?.specifiers || []
        },
        frequency,
        duration,
        presentingProblems,
        treatmentGoals,
        interventions,
        strengths,
        riskFactors,
        additionalNotes,
        assessments: initialContent?.assessments || []
      }

      const response = await fetch(`/api/plans/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ therapistContent }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save plan")
      }

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan")
    } finally {
      setIsSaving(false)
    }
  }

  const addPresentingProblem = () => {
    setPresentingProblems([...presentingProblems, ""])
  }

  const updatePresentingProblem = (index: number, value: string) => {
    const updated = [...presentingProblems]
    updated[index] = value
    setPresentingProblems(updated)
  }

  const removePresentingProblem = (index: number) => {
    setPresentingProblems(presentingProblems.filter((_, i) => i !== index))
  }

  const addGoal = () => {
    setTreatmentGoals([...treatmentGoals, { goal: "", target: "", measurable: "" }])
  }

  const updateGoal = (index: number, field: string, value: string) => {
    const updated = [...treatmentGoals]
    updated[index] = { ...updated[index], [field]: value }
    setTreatmentGoals(updated)
  }

  const removeGoal = (index: number) => {
    setTreatmentGoals(treatmentGoals.filter((_, i) => i !== index))
  }

  const addIntervention = () => {
    setInterventions([...interventions, { modality: "", frequency: "", techniques: [] }])
  }

  const updateIntervention = (index: number, field: string, value: any) => {
    const updated = [...interventions]
    updated[index] = { ...updated[index], [field]: value }
    setInterventions(updated)
  }

  const removeIntervention = (index: number) => {
    setInterventions(interventions.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Treatment Plan</DialogTitle>
          <DialogDescription>
            Make changes to the treatment plan. Saving will reset the plan to draft status.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Primary Diagnosis</Label>
              <Input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g., F32.1 - Major Depressive Disorder"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Session Frequency</Label>
                <Input
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g., Weekly 50-minute sessions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Treatment Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 12-16 weeks"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths">Client Strengths</Label>
              <Textarea
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Describe client strengths..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskFactors">Risk Assessment</Label>
              <Textarea
                id="riskFactors"
                value={riskFactors}
                onChange={(e) => setRiskFactors(e.target.value)}
                placeholder="Document risk factors and assessment..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional clinical notes..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="problems" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Presenting Problems</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPresentingProblem}>
                <Plus className="h-4 w-4 mr-1" /> Add Problem
              </Button>
            </div>

            <div className="space-y-3">
              {presentingProblems.map((problem, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Textarea
                    value={problem}
                    onChange={(e) => updatePresentingProblem(index, e.target.value)}
                    placeholder="Describe presenting problem..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePresentingProblem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {presentingProblems.length === 0 && (
                <p className="text-sm text-gray-500">No presenting problems added yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Treatment Goals</Label>
              <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-1" /> Add Goal
              </Button>
            </div>

            <div className="space-y-4">
              {treatmentGoals.map((goal, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Goal {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal Description</Label>
                    <Input
                      value={goal.goal}
                      onChange={(e) => updateGoal(index, "goal", e.target.value)}
                      placeholder="e.g., Reduce depressive symptoms"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target</Label>
                    <Input
                      value={goal.target}
                      onChange={(e) => updateGoal(index, "target", e.target.value)}
                      placeholder="e.g., 50% reduction in PHQ-9 score within 8 weeks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Measurement</Label>
                    <Input
                      value={goal.measurable}
                      onChange={(e) => updateGoal(index, "measurable", e.target.value)}
                      placeholder="e.g., PHQ-9 every 2 weeks"
                    />
                  </div>
                </div>
              ))}
              {treatmentGoals.length === 0 && (
                <p className="text-sm text-gray-500">No treatment goals added yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Therapeutic Interventions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIntervention}>
                <Plus className="h-4 w-4 mr-1" /> Add Intervention
              </Button>
            </div>

            <div className="space-y-4">
              {interventions.map((intervention, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Intervention {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIntervention(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Modality</Label>
                    <Input
                      value={intervention.modality}
                      onChange={(e) => updateIntervention(index, "modality", e.target.value)}
                      placeholder="e.g., Cognitive Behavioral Therapy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input
                      value={intervention.frequency}
                      onChange={(e) => updateIntervention(index, "frequency", e.target.value)}
                      placeholder="e.g., Weekly sessions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Techniques (comma-separated)</Label>
                    <Textarea
                      value={intervention.techniques.join(", ")}
                      onChange={(e) => updateIntervention(index, "techniques", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                      placeholder="e.g., Cognitive restructuring, Behavioral activation, Thought records"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {interventions.length === 0 && (
                <p className="text-sm text-gray-500">No interventions added yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

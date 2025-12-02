'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { CompareSection, type ComparisonItem } from '@/components/comparison/CompareSection'
import { MergeEditor, type MergedPlanData } from '@/components/comparison/MergeEditor'
import { Check, Zap, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SessionData = {
  id: string
  sessionDate: string
  client: {
    id: string
    displayName: string
  }
  impressions?: {
    concerns: Array<{ text: string; severity?: string; excerptIds?: string[] }>
    themes: string[]
    goals: Array<{ text: string; timeline?: string; excerptIds?: string[] }>
    strengths: Array<{ text: string; excerptIds?: string[] }>
  }
  aiAnalysis?: {
    concerns: Array<{ text: string; severity?: string; excerptIds?: string[] }>
    themes: string[]
    goals: Array<{ text: string; timeline?: string; excerptIds?: string[] }>
    strengths: Array<{ text: string; excerptIds?: string[] }>
    interventions: Array<{ name: string; rationale: string }>
    homework: Array<{ task: string; rationale: string }>
  }
  riskFlags?: Array<{
    id: string
    riskType: string
    severity: string
    excerpt: string
    acknowledged: boolean
  }>
}

export default function ComparePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showMergeEditor, setShowMergeEditor] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const data = await response.json()
      setSession(data.session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const convertToComparisonItems = (
    items: any[],
    source: 'therapist' | 'ai',
    type: string
  ): ComparisonItem[] => {
    return items.map((item, index) => ({
      id: `${source}-${type}-${index}`,
      text: typeof item === 'string' ? item : (item.text || item.name || item.task),
      source,
      severity: item.severity,
      timeline: item.timeline,
      excerptIds: item.excerptIds,
      rationale: item.rationale
    }))
  }

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const handleMergeSave = async (mergedData: MergedPlanData, saveAsDraft: boolean) => {
    try {
      setIsSaving(true)
      
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clientId: session?.client.id,
          status: saveAsDraft ? 'DRAFT' : 'APPROVED',
          content: {
            concerns: mergedData.concerns,
            themes: mergedData.themes,
            goals: mergedData.goals,
            strengths: mergedData.strengths,
            interventions: mergedData.interventions,
            homework: mergedData.homework
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create treatment plan')
      }

      const result = await response.json()
      
      setShowMergeEditor(false)
      
      router.push(`/therapist/plans/${result.plan.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save treatment plan')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Session not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const therapistConcerns = convertToComparisonItems(
    session.impressions?.concerns || [],
    'therapist',
    'concerns'
  )
  const aiConcerns = convertToComparisonItems(
    session.aiAnalysis?.concerns || [],
    'ai',
    'concerns'
  )

  const therapistThemes = convertToComparisonItems(
    session.impressions?.themes || [],
    'therapist',
    'themes'
  )
  const aiThemes = convertToComparisonItems(
    session.aiAnalysis?.themes || [],
    'ai',
    'themes'
  )

  const therapistGoals = convertToComparisonItems(
    session.impressions?.goals || [],
    'therapist',
    'goals'
  )
  const aiGoals = convertToComparisonItems(
    session.aiAnalysis?.goals || [],
    'ai',
    'goals'
  )

  const therapistStrengths = convertToComparisonItems(
    session.impressions?.strengths || [],
    'therapist',
    'strengths'
  )
  const aiStrengths = convertToComparisonItems(
    session.aiAnalysis?.strengths || [],
    'ai',
    'strengths'
  )

  const aiInterventions = convertToComparisonItems(
    session.aiAnalysis?.interventions || [],
    'ai',
    'interventions'
  )

  const aiHomework = convertToComparisonItems(
    session.aiAnalysis?.homework || [],
    'ai',
    'homework'
  )

  const getAllItems = () => {
    const allItems = [
      ...therapistConcerns,
      ...aiConcerns,
      ...therapistThemes,
      ...aiThemes,
      ...therapistGoals,
      ...aiGoals,
      ...therapistStrengths,
      ...aiStrengths,
      ...aiInterventions,
      ...aiHomework
    ]
    return allItems
  }

  const getSelectedItemsByType = () => {
    const allItems = getAllItems()
    const selected = allItems.filter(item => selectedItems.has(item.id))

    return {
      concerns: selected.filter(item => item.id.includes('concerns')),
      themes: selected.filter(item => item.id.includes('themes')),
      goals: selected.filter(item => item.id.includes('goals')),
      strengths: selected.filter(item => item.id.includes('strengths')),
      interventions: selected.filter(item => item.id.includes('interventions')),
      homework: selected.filter(item => item.id.includes('homework'))
    }
  }

  const hasRiskFlags = session.riskFlags && session.riskFlags.length > 0
  const unacknowledgedRisks = session.riskFlags?.filter(r => !r.acknowledged) || []

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compare & Merge</h1>
            <p className="text-gray-500 mt-1">
              {session.client.displayName} - {new Date(session.sessionDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {hasRiskFlags && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Risk Flags Detected</h3>
            <div className="space-y-2">
              {session.riskFlags?.map(flag => (
                <div key={flag.id} className="border-l-4 border-destructive pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive">{flag.riskType}</Badge>
                    <Badge variant="outline">{flag.severity}</Badge>
                    {flag.acknowledged && (
                      <Badge variant="secondary" className="text-xs">
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm italic">&quot;{flag.excerpt}&quot;</p>
                </div>
              ))}
            </div>
            {unacknowledgedRisks.length > 0 && (
              <p className="mt-3 text-sm font-medium">
                Please acknowledge all risk flags before proceeding.
              </p>
            )}
          </div>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">
            LEGEND
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Aligned - Both noted this</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>AI Surfaced - You may have missed this</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4" />
              <span>Therapist Only - AI did not detect this</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="space-y-6">
        <CompareSection
          title="Clinical Concerns"
          therapistItems={therapistConcerns}
          aiItems={aiConcerns}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          type="concerns"
        />

        <CompareSection
          title="Session Themes"
          therapistItems={therapistThemes}
          aiItems={aiThemes}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          type="themes"
        />

        <CompareSection
          title="Treatment Goals"
          therapistItems={therapistGoals}
          aiItems={aiGoals}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          type="goals"
        />

        <CompareSection
          title="Client Strengths"
          therapistItems={therapistStrengths}
          aiItems={aiStrengths}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          type="strengths"
        />

        <CompareSection
          title="Recommended Interventions"
          therapistItems={[]}
          aiItems={aiInterventions}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          type="interventions"
        />

        <CompareSection
          title="Homework Assignments"
          therapistItems={[]}
          aiItems={aiHomework}
          selectedItems={selectedItems}
          onToggleItem={toggleItem}
          type="homework"
        />
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <div className="text-sm text-gray-500 self-center">
          {selectedItems.size} items selected
        </div>
        <Button
          onClick={() => setShowMergeEditor(true)}
          disabled={selectedItems.size === 0}
          size="lg"
        >
          Create Merged Treatment Plan
        </Button>
      </div>

      <MergeEditor
        open={showMergeEditor}
        onOpenChange={setShowMergeEditor}
        selectedItems={getSelectedItemsByType()}
        onSave={handleMergeSave}
        isSaving={isSaving}
      />
    </div>
  )
}

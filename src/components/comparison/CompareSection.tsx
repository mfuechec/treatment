'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ComparisonItem = {
  id: string
  text: string
  source: 'therapist' | 'ai' | 'both'
  severity?: string
  timeline?: string
  excerptIds?: string[]
  rationale?: string
}

type CompareSectionProps = {
  title: string
  therapistItems: ComparisonItem[]
  aiItems: ComparisonItem[]
  selectedItems: Set<string>
  onToggleItem: (itemId: string) => void
  type: 'concerns' | 'themes' | 'goals' | 'strengths' | 'interventions' | 'homework'
}

export function CompareSection({
  title,
  therapistItems,
  aiItems,
  selectedItems,
  onToggleItem,
  type
}: CompareSectionProps) {
  // Merge and categorize items
  const mergedItems = React.useMemo(() => {
    const items: ComparisonItem[] = []
    const aiMap = new Map(aiItems.map(item => [item.text.toLowerCase().trim(), item]))
    const processedAi = new Set<string>()

    // Process therapist items and find matches
    therapistItems.forEach(therapistItem => {
      const normalizedText = therapistItem.text.toLowerCase().trim()
      const aiMatch = aiMap.get(normalizedText)

      if (aiMatch) {
        // Both have this item
        items.push({
          ...therapistItem,
          source: 'both',
          id: therapistItem.id
        })
        processedAi.add(normalizedText)
      } else {
        // Therapist only
        items.push({
          ...therapistItem,
          source: 'therapist',
          id: therapistItem.id
        })
      }
    })

    // Add AI-only items
    aiItems.forEach(aiItem => {
      const normalizedText = aiItem.text.toLowerCase().trim()
      if (!processedAi.has(normalizedText)) {
        items.push({
          ...aiItem,
          source: 'ai',
          id: aiItem.id
        })
      }
    })

    return items
  }, [therapistItems, aiItems])

  const getAlignmentIcon = (source: ComparisonItem['source']) => {
    switch (source) {
      case 'both':
        return <Check className="h-4 w-4 text-green-600" />
      case 'ai':
        return <Zap className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  const getAlignmentLabel = (source: ComparisonItem['source']) => {
    switch (source) {
      case 'both':
        return 'Aligned'
      case 'ai':
        return 'AI Surfaced'
      case 'therapist':
        return 'Therapist Only'
      default:
        return ''
    }
  }

  const stats = React.useMemo(() => {
    const aligned = mergedItems.filter(i => i.source === 'both').length
    const aiSurfaced = mergedItems.filter(i => i.source === 'ai').length
    const therapistOnly = mergedItems.filter(i => i.source === 'therapist').length
    return { aligned, aiSurfaced, therapistOnly }
  }, [mergedItems])

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-600" />
              {stats.aligned} aligned
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-600" />
              {stats.aiSurfaced} AI surfaced
            </span>
            <span>{stats.therapistOnly} therapist only</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mergedItems.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No items found</p>
          ) : (
            mergedItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  selectedItems.has(item.id)
                    ? "bg-teal-500/5 border-primary/20"
                    : "bg-white hover:bg-gray-100/50"
                )}
              >
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => onToggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed">{item.text}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {getAlignmentIcon(item.source)}
                      <Badge
                        variant={
                          item.source === 'both'
                            ? 'default'
                            : item.source === 'ai'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {getAlignmentLabel(item.source)}
                      </Badge>
                    </div>
                  </div>

                  {/* Show additional metadata based on type */}
                  {(item.severity || item.timeline || item.rationale) && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {item.severity && (
                        <Badge variant="outline" className="text-xs">
                          {item.severity}
                        </Badge>
                      )}
                      {item.timeline && (
                        <Badge variant="outline" className="text-xs">
                          Timeline: {item.timeline}
                        </Badge>
                      )}
                      {item.rationale && (
                        <span className="italic">Rationale: {item.rationale}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

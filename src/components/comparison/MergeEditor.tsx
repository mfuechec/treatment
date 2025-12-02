'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, GripVertical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComparisonItem } from './CompareSection'

type MergeEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: {
    concerns: ComparisonItem[]
    themes: ComparisonItem[]
    goals: ComparisonItem[]
    strengths: ComparisonItem[]
    interventions: ComparisonItem[]
    homework: ComparisonItem[]
  }
  onSave: (merged: MergedPlanData, saveAsDraft: boolean) => void
  isSaving: boolean
}

export type MergedPlanData = {
  concerns: string[]
  themes: string[]
  goals: string[]
  strengths: string[]
  interventions: Array<{ name: string; rationale: string }>
  homework: Array<{ task: string; rationale: string }>
}

export function MergeEditor({
  open,
  onOpenChange,
  selectedItems,
  onSave,
  isSaving
}: MergeEditorProps) {
  const [editedItems, setEditedItems] = useState<MergedPlanData>({
    concerns: selectedItems.concerns.map(i => i.text),
    themes: selectedItems.themes.map(i => i.text),
    goals: selectedItems.goals.map(i => i.text),
    strengths: selectedItems.strengths.map(i => i.text),
    interventions: selectedItems.interventions.map(i => ({
      name: i.text,
      rationale: i.rationale || ''
    })),
    homework: selectedItems.homework.map(i => ({
      task: i.text,
      rationale: i.rationale || ''
    }))
  })

  React.useEffect(() => {
    setEditedItems({
      concerns: selectedItems.concerns.map(i => i.text),
      themes: selectedItems.themes.map(i => i.text),
      goals: selectedItems.goals.map(i => i.text),
      strengths: selectedItems.strengths.map(i => i.text),
      interventions: selectedItems.interventions.map(i => ({
        name: i.text,
        rationale: i.rationale || ''
      })),
      homework: selectedItems.homework.map(i => ({
        task: i.text,
        rationale: i.rationale || ''
      }))
    })
  }, [selectedItems])

  const handleRemoveItem = (section: keyof MergedPlanData, index: number) => {
    setEditedItems(prev => ({
      ...prev,
      [section]: Array.isArray(prev[section])
        ? (prev[section] as any[]).filter((_, i) => i !== index)
        : prev[section]
    }))
  }

  const handleEditItem = (
    section: keyof MergedPlanData,
    index: number,
    value: string | { name?: string; task?: string; rationale?: string }
  ) => {
    setEditedItems(prev => {
      const items = [...(prev[section] as any[])]
      if (typeof value === 'string') {
        items[index] = value
      } else {
        items[index] = { ...items[index], ...value }
      }
      return { ...prev, [section]: items }
    })
  }

  const handleAddItem = (section: keyof MergedPlanData) => {
    setEditedItems(prev => {
      if (section === 'interventions') {
        return {
          ...prev,
          interventions: [...prev.interventions, { name: '', rationale: '' }]
        }
      } else if (section === 'homework') {
        return {
          ...prev,
          homework: [...prev.homework, { task: '', rationale: '' }]
        }
      } else {
        return {
          ...prev,
          [section]: [...(prev[section] as string[]), '']
        }
      }
    })
  }

  const renderSimpleList = (
    section: 'concerns' | 'themes' | 'goals' | 'strengths',
    title: string
  ) => {
    const items = editedItems[section]
    const sectionName = section.substring(0, section.length - 1)
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(section)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-500" />
                <Textarea
                  value={item}
                  onChange={(e) => handleEditItem(section, index, e.target.value)}
                  className="flex-1 min-h-[60px]"
                  placeholder={`Enter ${sectionName}...`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(section, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComplexList = (
    section: 'interventions' | 'homework',
    title: string,
    nameKey: 'name' | 'task'
  ) => {
    const items = editedItems[section]
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(section)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-gray-500 mt-2" />
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={(item as any)[nameKey]}
                      onChange={(e) =>
                        handleEditItem(section, index, { [nameKey]: e.target.value })
                      }
                      className="min-h-[60px]"
                      placeholder={`Enter ${nameKey}...`}
                    />
                    <Textarea
                      value={item.rationale}
                      onChange={(e) =>
                        handleEditItem(section, index, { rationale: e.target.value })
                      }
                      className="min-h-[60px]"
                      placeholder="Enter rationale..."
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(section, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalize Merged Treatment Plan</DialogTitle>
          <DialogDescription>
            Review, edit, and organize the selected items for your treatment plan.
            You can add new items, edit existing ones, or remove items as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderSimpleList('concerns', 'Clinical Concerns')}
          {renderSimpleList('themes', 'Session Themes')}
          {renderSimpleList('goals', 'Treatment Goals')}
          {renderSimpleList('strengths', 'Client Strengths')}
          {renderComplexList('interventions', 'Recommended Interventions', 'name')}
          {renderComplexList('homework', 'Homework Assignments', 'task')}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => onSave(editedItems, true)}
            disabled={isSaving}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => onSave(editedItems, false)}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Create Treatment Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

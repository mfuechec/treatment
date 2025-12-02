"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { EditPlanModal } from "./EditPlanModal"

interface EditPlanButtonProps {
  planId: string
  therapistContent: any
}

export function EditPlanButton({ planId, therapistContent }: EditPlanButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Plan
      </Button>
      <EditPlanModal
        open={isOpen}
        onOpenChange={setIsOpen}
        planId={planId}
        initialContent={therapistContent}
      />
    </>
  )
}

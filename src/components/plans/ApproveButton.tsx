"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface ApproveButtonProps {
  planId: string
}

export function ApproveButton({ planId }: ApproveButtonProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    setIsApproving(true)
    setError("")

    try {
      const response = await fetch(`/api/plans/${planId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to approve plan")
      }

      // Refresh the page to show updated status
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve plan")
      console.error("Approve error:", err)
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div>
      <Button onClick={handleApprove} disabled={isApproving}>
        {isApproving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Plan
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}

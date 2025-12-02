"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Loader2,
  Calendar,
  User,
  FileText,
  Edit,
  GitCompare,
  ClipboardList,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  Sparkles,
} from "lucide-react"

interface Session {
  id: string
  sessionDate: string
  transcript: string
  status: string
  client: {
    id: string
    displayName: string | null
    user: {
      email: string
    }
  }
  impressions?: {
    id: string
    riskObservations?: {
      level: string
      notes?: string
    }
    concerns?: Array<{
      text: string
      severity: string
    }>
  }
  treatmentPlan?: {
    id: string
    status: string
    generatedAt: string
  }
}

export default function SessionDetailPage(props: PageProps<"/therapist/sessions/[id]">) {
  const { id } = use(props.params)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedTranscript, setHighlightedTranscript] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState("")

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${id}`)
        if (!response.ok) throw new Error("Failed to load session")
        const data = await response.json()
        setSession(data.session)
        setHighlightedTranscript(data.session.transcript)
      } catch (err) {
        setError("Failed to load session details")
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [id])

  useEffect(() => {
    if (!session) return

    if (searchQuery.trim()) {
      const regex = new RegExp(`(${searchQuery})`, "gi")
      const highlighted = session.transcript.replace(
        regex,
        '<mark class="bg-yellow-200">$1</mark>'
      )
      setHighlightedTranscript(highlighted)
    } else {
      setHighlightedTranscript(session.transcript)
    }
  }, [searchQuery, session])

  const runAIAnalysis = async () => {
    if (!session) return

    setAnalyzing(true)
    setAnalyzeError("")

    try {
      const response = await fetch(`/api/sessions/${id}/analyze`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to run AI analysis")
      }

      // Redirect to compare view after successful analysis
      router.push(`/therapist/sessions/${id}/compare`)
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Failed to run AI analysis")
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusInfo = () => {
    if (!session) return { label: "Unknown", variant: "secondary" as const, icon: Clock }

    if (session.treatmentPlan?.status === "APPROVED") {
      return { label: "Completed", variant: "default" as const, icon: CheckCircle2 }
    }
    if (session.treatmentPlan) {
      return { label: "Plan Generated", variant: "secondary" as const, icon: FileText }
    }
    if (session.impressions) {
      return { label: "Impressions Recorded", variant: "secondary" as const, icon: Edit }
    }
    return { label: "Transcript Uploaded", variant: "outline" as const, icon: Upload }
  }

  const getRiskBadge = () => {
    if (!session?.impressions?.riskObservations) return null

    const { level } = session.impressions.riskObservations
    if (level === "none") return null

    const variants = {
      low: { color: "bg-yellow-50 text-yellow-800 border-yellow-200", icon: AlertCircle },
      moderate: { color: "bg-orange-50 text-orange-800 border-orange-200", icon: AlertTriangle },
      high: { color: "bg-red-50 text-red-800 border-red-200", icon: AlertTriangle },
    }

    const config = variants[level as keyof typeof variants]
    if (!config) return null

    const Icon = config.icon

    return (
      <Alert className={`${config.color} border`}>
        <Icon className="h-4 w-4" />
        <AlertDescription>
          <span className="font-semibold">{level.toUpperCase()} RISK IDENTIFIED</span>
          {session.impressions.riskObservations.notes && (
            <p className="mt-1 text-sm">
              {session.impressions.riskObservations.notes}
            </p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Session not found"}</AlertDescription>
      </Alert>
    )
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
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
        <Badge variant={statusInfo.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Risk Alert */}
      {getRiskBadge()}

      {/* Analyze Error Alert */}
      {analyzeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{analyzeError}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this session and treatment plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href={`/therapist/sessions/${session.id}/impressions`}>
                <div className="flex flex-col items-center gap-2">
                  <Edit className="h-5 w-5" />
                  <span className="text-sm">
                    {session.impressions ? "Edit" : "Add"} Impressions
                  </span>
                </div>
              </Link>
            </Button>

            {/* Show AI Analysis button when impressions exist but no treatment plan yet */}
            {session.impressions && !session.treatmentPlan && (
              <Button
                variant="default"
                className="h-auto py-4"
                onClick={runAIAnalysis}
                disabled={analyzing}
              >
                <div className="flex flex-col items-center gap-2">
                  {analyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span className="text-sm">
                    {analyzing ? "Analyzing..." : "Run AI Analysis"}
                  </span>
                </div>
              </Button>
            )}

            {session.treatmentPlan && (
              <>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link href={`/therapist/plans/${session.treatmentPlan.id}`}>
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      <span className="text-sm">View Treatment Plan</span>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4">
                  <Link href={`/therapist/sessions/${session.id}/compare`}>
                    <div className="flex flex-col items-center gap-2">
                      <GitCompare className="h-5 w-5" />
                      <span className="text-sm">Compare View</span>
                    </div>
                  </Link>
                </Button>
              </>
            )}

            <Button asChild variant="outline" className="h-auto py-4">
              <Link href={`/client/plan${session.treatmentPlan?.id || ""}`}>
                <div className="flex flex-col items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  <span className="text-sm">Client View</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transcript" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="impressions" disabled={!session.impressions}>
            Impressions
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Session Transcript</CardTitle>
                  <CardDescription>
                    Full transcript from {new Date(session.sessionDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search transcript..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="p-4 bg-gray-50 rounded-lg border max-h-[600px] overflow-y-auto"
                style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: highlightedTranscript }}
              />
              <div className="mt-4 text-sm text-gray-500">
                {session.transcript.length} characters
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impressions Tab */}
        <TabsContent value="impressions">
          {session.impressions ? (
            <div className="space-y-4">
              {/* Presenting Concerns */}
              {Array.isArray(session.impressions.concerns) && session.impressions.concerns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Presenting Concerns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.impressions.concerns.map((concern, idx) => (
                        <div key={idx} className="flex items-start gap-3">
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
                          <p className="text-gray-900">{concern.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risk Assessment */}
              {session.impressions.riskObservations && session.impressions.riskObservations.level !== "none" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Level:</span>
                        <Badge
                          variant={
                            session.impressions.riskObservations.level === "high"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {session.impressions.riskObservations.level}
                        </Badge>
                      </div>
                      {session.impressions.riskObservations.notes && (
                        <div>
                          <span className="font-medium">Evidence:</span>
                          <p className="text-gray-700 mt-1">
                            {session.impressions.riskObservations.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button asChild>
                  <Link href={`/therapist/sessions/${session.id}/impressions`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Impressions
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Edit className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No impressions recorded yet</p>
                <Button asChild>
                  <Link href={`/therapist/sessions/${session.id}/impressions`}>
                    Add Impressions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Session Timeline</CardTitle>
              <CardDescription>Track progress through the workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Transcript Upload */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="w-px h-full bg-gray-300 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium">Transcript Uploaded</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Impressions */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        session.impressions
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {session.impressions ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="w-px h-full bg-gray-300 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium">Therapist Impressions</p>
                    <p className="text-sm text-gray-500">
                      {session.impressions
                        ? "Completed"
                        : "Not started"}
                    </p>
                  </div>
                </div>

                {/* Treatment Plan */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        session.treatmentPlan ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {session.treatmentPlan ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="w-px h-full bg-gray-300 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium">Treatment Plan Generated</p>
                    <p className="text-sm text-gray-500">
                      {session.treatmentPlan
                        ? new Date(
                            session.treatmentPlan.generatedAt
                          ).toLocaleDateString()
                        : "Pending"}
                    </p>
                  </div>
                </div>

                {/* Approval */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        session.treatmentPlan?.status === "APPROVED"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {session.treatmentPlan?.status === "APPROVED" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Plan Approved</p>
                    <p className="text-sm text-gray-500">
                      {session.treatmentPlan?.status === "APPROVED"
                        ? "Completed"
                        : "Awaiting approval"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

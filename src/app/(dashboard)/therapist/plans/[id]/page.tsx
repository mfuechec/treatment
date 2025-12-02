import { getServerSession } from "next-auth/next"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  FileText,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Lightbulb,
  ClipboardList,
  Heart,
  Calendar,
  TrendingUp,
  ExternalLink,
  History,
} from "lucide-react"
import { ApproveButton } from "@/components/plans/ApproveButton"
import { EditPlanButton } from "@/components/plans/EditPlanButton"

export default async function TherapistPlanDetailPage(
  props: PageProps<"/therapist/plans/[id]">
) {
  const { id } = await props.params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "THERAPIST") {
    redirect("/login")
  }

  // Fetch treatment plan with all versions
  const plan = await prisma.treatmentPlan.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          user: true,
        },
      },
      versions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!plan) {
    notFound()
  }

  // Verify therapist owns this client
  const client = await prisma.client.findUnique({
    where: { id: plan.clientId },
    select: { therapistId: true },
  })

  if (client?.therapistId !== session.user.therapistId) {
    redirect("/therapist/plans")
  }

  const latestVersion = plan.versions[0]
  const therapistContent = latestVersion?.therapistContent as any
  const clientContent = latestVersion?.clientContent as any

  // Fetch source session
  const sourceSession = latestVersion
    ? await prisma.session.findUnique({
        where: { id: latestVersion.sourceSessionId },
        select: { id: true, sessionDate: true },
      })
    : null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            High
          </Badge>
        )
      case "moderate":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Moderate
          </Badge>
        )
      case "low":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Treatment Plan
            </h1>
            {latestVersion && getStatusBadge(latestVersion.status)}
          </div>
          <p className="text-gray-600">
            {plan.client.displayName || plan.client.displayName} •{" "}
            {plan.client.user.email}
          </p>
        </div>
        <div className="flex gap-3">
          {latestVersion?.status === "DRAFT" && (
            <ApproveButton planId={plan.id} />
          )}
          <EditPlanButton planId={plan.id} therapistContent={therapistContent} />
        </div>
      </div>

      {/* Source session link */}
      {sourceSession && (
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            Generated from session on{" "}
            {new Date(sourceSession.sessionDate).toLocaleDateString()} •{" "}
            <Link
              href={`/therapist/sessions/${sourceSession.id}`}
              className="font-medium underline"
            >
              View Session
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for Therapist vs Client view */}
      <Tabs defaultValue="therapist" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="therapist">Therapist View</TabsTrigger>
          <TabsTrigger value="client">Client Preview</TabsTrigger>
        </TabsList>

        {/* Therapist View */}
        <TabsContent value="therapist" className="space-y-6 mt-6">
          {/* Diagnosis & Assessment */}
          {therapistContent?.diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Clinical Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">
                    Primary Diagnosis
                  </p>
                  <p className="text-gray-700">
                    {typeof therapistContent.diagnosis === "string"
                      ? therapistContent.diagnosis
                      : therapistContent.diagnosis.primary || JSON.stringify(therapistContent.diagnosis)}
                  </p>
                </div>
                {therapistContent.diagnosis?.specifiers && Array.isArray(therapistContent.diagnosis.specifiers) && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Specifiers</p>
                    <div className="flex flex-wrap gap-2">
                      {therapistContent.diagnosis.specifiers.map((spec: string, idx: number) => (
                        <Badge key={idx} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {therapistContent.frequency && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Session Frequency</p>
                    <p className="text-gray-700">{therapistContent.frequency}</p>
                  </div>
                )}
                {therapistContent.duration && (
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Treatment Duration</p>
                    <p className="text-gray-700">{therapistContent.duration}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Presenting Problems/Concerns */}
          {(Array.isArray(therapistContent?.presentingProblems) || Array.isArray(therapistContent?.concerns)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Presenting Problems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(therapistContent.presentingProblems || therapistContent.concerns || []).map(
                    (item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-lg border"
                      >
                        <p className="font-medium text-gray-900">
                          {typeof item === "string" ? item : item.text || item.description}
                        </p>
                        {typeof item === "object" && item.severity && (
                          <div className="mt-2">{getSeverityBadge(item.severity)}</div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Treatment Goals */}
          {(therapistContent?.treatmentGoals || therapistContent?.goals) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Treatment Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(therapistContent.treatmentGoals || therapistContent.goals || []).map(
                    (goal: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {typeof goal === "string" ? goal : goal.goal || goal.text}
                            </p>
                            {typeof goal === "object" && goal.target && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Target:</span> {goal.target}
                              </p>
                            )}
                            {typeof goal === "object" && goal.measurable && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Measure:</span> {goal.measurable}
                              </p>
                            )}
                            {typeof goal === "object" && goal.status && (
                              <Badge className="mt-2" variant="outline">{goal.status}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interventions */}
          {Array.isArray(therapistContent?.interventions) &&
            therapistContent.interventions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Therapeutic Interventions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {therapistContent.interventions.map(
                      (intervention: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-green-50 rounded-lg border border-green-200"
                        >
                          <p className="font-semibold text-gray-900 mb-2">
                            {intervention.modality || intervention.name || intervention.text || "Intervention"}
                          </p>
                          {intervention.rationale && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Rationale:</span>{" "}
                              {intervention.rationale}
                            </p>
                          )}
                          {intervention.frequency && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Frequency:</span> {intervention.frequency}
                            </p>
                          )}
                          {Array.isArray(intervention.techniques) && intervention.techniques.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Techniques:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {intervention.techniques.map((tech: string, techIdx: number) => (
                                  <li key={techIdx}>{tech}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Homework Assignments */}
          {Array.isArray(therapistContent?.homework) &&
            therapistContent.homework.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Homework Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {therapistContent.homework.map(
                      (hw: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <p className="text-gray-900 font-medium mb-1">
                            {hw.task || hw.text}
                          </p>
                          {hw.rationale && (
                            <p className="text-sm text-gray-700">
                              {hw.rationale}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Client Strengths */}
          {therapistContent?.strengths && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Client Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeof therapistContent.strengths === "string" ? (
                  <p className="text-gray-700">{therapistContent.strengths}</p>
                ) : Array.isArray(therapistContent.strengths) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {therapistContent.strengths.map(
                      (strength: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-pink-50 rounded-lg border border-pink-200"
                        >
                          <p className="text-gray-900">
                            {typeof strength === "string"
                              ? strength
                              : strength.text}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Assessments */}
          {Array.isArray(therapistContent?.assessments) &&
            therapistContent.assessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {therapistContent.assessments.map((assessment: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700">{assessment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Risk Factors */}
          {therapistContent?.riskFactors && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{therapistContent.riskFactors}</p>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {therapistContent?.additionalNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{therapistContent.additionalNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Risk Indicators (legacy format) */}
          {Array.isArray(therapistContent?.riskIndicators) &&
            therapistContent.riskIndicators.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {therapistContent.riskIndicators.map(
                      (risk: any, idx: number) => (
                        <Alert key={idx} variant="destructive">
                          <AlertDescription>
                            <p className="font-semibold mb-1">
                              {risk.type || "Risk Alert"}
                            </p>
                            <p>{risk.description || risk.text}</p>
                            {risk.severity && (
                              <div className="mt-2">
                                {getSeverityBadge(risk.severity)}
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* Client Preview */}
        <TabsContent value="client" className="space-y-6 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Your Treatment Plan
                </h2>
                <p className="text-blue-100">
                  Working together towards your wellness goals
                </p>
              </div>

              {clientContent ? (
                <div className="space-y-6">
                  {/* What We're Working On */}
                  {clientContent.summary && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        What We're Working On
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {clientContent.summary}
                      </p>
                    </div>
                  )}

                  {/* Your Goals */}
                  {Array.isArray(clientContent?.goals) && clientContent.goals.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          Your Goals
                        </h3>
                        <div className="space-y-3">
                          {clientContent.goals.map((goal: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-4 bg-green-50 rounded-lg"
                            >
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-900">{goal}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Our Approach */}
                  {Array.isArray(clientContent?.interventions) &&
                    clientContent.interventions.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-purple-600" />
                            Our Approach
                          </h3>
                          <div className="space-y-3">
                            {clientContent.interventions.map(
                              (intervention: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-4 bg-purple-50 rounded-lg"
                                >
                                  <p className="text-gray-900">{intervention}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Between Sessions */}
                  {Array.isArray(clientContent?.homework) &&
                    clientContent.homework.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-orange-600" />
                            Between Sessions
                          </h3>
                          <div className="space-y-3">
                            {clientContent.homework.map(
                              (task: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg"
                                >
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-semibold">
                                    {idx + 1}
                                  </div>
                                  <p className="text-gray-900">{task}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Your Strengths */}
                  {Array.isArray(clientContent?.strengths) &&
                    clientContent.strengths.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Heart className="h-5 w-5 text-pink-600" />
                            Your Strengths
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {clientContent.strengths.map(
                              (strength: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-pink-50 rounded-lg border border-pink-200"
                                >
                                  <p className="text-gray-900">{strength}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Last Updated */}
                  <div className="text-sm text-gray-500 text-center pt-6 border-t">
                    Last updated:{" "}
                    {new Date(latestVersion.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    Client-friendly version will be available after plan
                    approval.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History Sidebar */}
      {plan.versions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription>
              {plan.versions.length} version
              {plan.versions.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.versions.map((version, idx) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border ${
                    idx === 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Version {version.versionNumber}
                        {idx === 0 && (
                          <Badge className="ml-2" variant="outline">
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(version.createdAt).toLocaleDateString()} •{" "}
                        {getStatusBadge(version.status)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

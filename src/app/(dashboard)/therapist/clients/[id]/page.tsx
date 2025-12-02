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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  User,
  Mail,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
} from "lucide-react"

export default async function ClientDetailPage(
  props: PageProps<"/therapist/clients/[id]">
) {
  const { id } = await props.params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "THERAPIST") {
    redirect("/login")
  }

  // Fetch client with all related data
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: true,
      sessions: {
        orderBy: {
          sessionDate: "desc",
        },
        include: {
          riskFlags: {
            where: {
              acknowledged: false,
            },
          },
        },
      },
      treatmentPlans: {
        include: {
          versions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
  })

  if (!client) {
    notFound()
  }

  // Verify therapist owns this client
  if (client.therapistId !== session.user.therapistId) {
    redirect("/therapist/clients")
  }

  // Count unacknowledged risks
  const unacknowledgedRisks = await prisma.riskFlag.findMany({
    where: {
      session: {
        clientId: client.id,
      },
      acknowledged: false,
    },
    include: {
      session: {
        select: {
          sessionDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const latestPlan = client.treatmentPlans[0]
  const latestVersion = latestPlan?.versions[0]

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case "TRANSCRIPT_UPLOADED":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Uploaded
          </Badge>
        )
      case "IMPRESSIONS_COMPLETE":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Impressions Done
          </Badge>
        )
      case "AI_ANALYZED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            AI Analyzed
          </Badge>
        )
      case "COMPARISON_READY":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Ready for Review
          </Badge>
        )
      case "PLAN_MERGED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Plan Created
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskSeverityBadge = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            High Risk
          </Badge>
        )
      case "MODERATE":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Moderate Risk
          </Badge>
        )
      case "LOW":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Low Risk
          </Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Client info header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-2xl">
                  {getInitials(client.displayName || client.displayName)}
                </AvatarFallback>
              </Avatar>

              {/* Client details */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {client.displayName || client.displayName}
                </h1>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{client.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Client ID: {client.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClipboardList className="h-4 w-4" />
                    <span>{client.sessions.length} total sessions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href={`/therapist/sessions/upload?clientId=${client.id}`}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Session
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk alerts */}
      {unacknowledgedRisks.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">
              {unacknowledgedRisks.length} Unacknowledged Risk Alert
              {unacknowledgedRisks.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2">
              {unacknowledgedRisks.slice(0, 3).map((risk) => (
                <div key={risk.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {getRiskSeverityBadge(risk.severity)}
                    <span className="text-gray-700">
                      {risk.riskType} •{" "}
                      {new Date(
                        risk.session.sessionDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-800 italic">"{risk.excerpt}"</p>
                </div>
              ))}
              {unacknowledgedRisks.length > 3 && (
                <p className="text-sm font-medium mt-2">
                  + {unacknowledgedRisks.length - 3} more
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current treatment plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Current Treatment Plan
              </CardTitle>
              <CardDescription>
                Active treatment plan for this client
              </CardDescription>
            </div>
            {latestPlan && (
              <Button asChild variant="outline">
                <Link href={`/therapist/plans/${latestPlan.id}`}>
                  View Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {latestPlan && latestVersion ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900">
                      Version {latestVersion.versionNumber}
                    </p>
                    {latestVersion.status === "DRAFT" ? (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Draft
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Last updated:{" "}
                    {new Date(latestPlan.updatedAt).toLocaleDateString()}
                  </p>
                  {(latestVersion.therapistContent as any)?.diagnosis?.primary && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Diagnosis:</span>{" "}
                      {(latestVersion.therapistContent as any).diagnosis.primary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No treatment plan yet</p>
              <p className="text-sm mt-1 mb-4">
                Upload a session transcript to generate a treatment plan
              </p>
              <Button asChild variant="outline">
                <Link href={`/therapist/sessions/upload?clientId=${client.id}`}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Session
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session history */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session History
              </CardTitle>
              <CardDescription>
                {client.sessions.length} session
                {client.sessions.length !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={`/therapist/sessions/upload?clientId=${client.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Session
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {client.sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No sessions yet</p>
              <p className="text-sm mt-1 mb-4">
                Upload a session transcript to get started
              </p>
              <Button asChild>
                <Link href={`/therapist/sessions/upload?clientId=${client.id}`}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Session
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {client.sessions.map((sessionItem) => (
                <div
                  key={sessionItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">
                        Session on{" "}
                        {new Date(sessionItem.sessionDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      {getSessionStatusBadge(sessionItem.status)}
                      {sessionItem.riskFlags.length > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {sessionItem.riskFlags.length} Risk
                          {sessionItem.riskFlags.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(sessionItem.sessionDate).toLocaleDateString()}
                      </span>
                      <span className="capitalize">
                        {sessionItem.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/therapist/sessions/${sessionItem.id}`}>
                      View
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Session</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {client.sessions.length > 0
                ? new Date(
                    client.sessions[0].sessionDate
                  ).toLocaleDateString()
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                unacknowledgedRisks.length > 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                unacknowledgedRisks.length > 0
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {unacknowledgedRisks.length}
            </div>
            <p className="text-xs text-gray-500">
              Unacknowledged risks
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

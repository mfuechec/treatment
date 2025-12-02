import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
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
import Link from "next/link"
import {
  Calendar,
  ClipboardList,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Sparkles,
} from "lucide-react"

export default async function ClientSessionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/login")
  }

  // Fetch all sessions for this client
  const sessions = await prisma.session.findMany({
    where: {
      clientId: session.user.clientId!,
    },
    include: {
      summary: true,
    },
    orderBy: {
      sessionDate: "desc",
    },
  })

  // Separate upcoming and past sessions
  const now = new Date()
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.sessionDate) >= now
  )
  const pastSessions = sessions.filter((s) => new Date(s.sessionDate) < now)

  const getSessionIcon = (status: string) => {
    if (status === "PLAN_MERGED") {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <ClipboardList className="h-5 w-5 text-blue-600" />
  }

  const formatSessionDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const sessionDate = new Date(date)
    const diffTime = sessionDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays === -1) return "Yesterday"
    if (diffDays > 1) return `In ${diffDays} days`
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
    return ""
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Your Sessions</h1>
        <p className="text-purple-100">
          View your therapy session history and upcoming appointments
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-gray-500">
              Sessions completed and scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Past Sessions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastSessions.length}</div>
            <p className="text-xs text-gray-500">
              Sessions you've attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-gray-500">
              Sessions scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your scheduled therapy sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.map((sessionItem) => (
                <div
                  key={sessionItem.id}
                  className="flex items-center justify-between p-5 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Therapy Session
                      </p>
                      <p className="text-sm text-gray-700">
                        {formatSessionDate(sessionItem.sessionDate)}
                      </p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {getRelativeTime(sessionItem.sessionDate)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Past Sessions
          </CardTitle>
          <CardDescription>
            {pastSessions.length} session
            {pastSessions.length !== 1 ? "s" : ""} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No sessions yet</p>
              <p className="text-sm mt-2">
                Your session history will appear here after your first
                appointment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastSessions.map((sessionItem) => {
                const hasSummary = sessionItem.summary?.clientSummary

                return (
                  <div
                    key={sessionItem.id}
                    className="flex items-center justify-between p-5 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getSessionIcon(sessionItem.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-900">
                            Therapy Session
                          </p>
                          {sessionItem.status === "PLAN_MERGED" && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Plan Updated
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          {formatSessionDate(sessionItem.sessionDate)}
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            {getRelativeTime(sessionItem.sessionDate)}
                          </span>
                        </div>
                        {hasSummary && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-medium text-gray-900">
                                Session Summary Available
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {sessionItem.summary?.clientSummary}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {hasSummary && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/client/sessions/${sessionItem.id}`}>
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encouragement section */}
      {pastSessions.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-600 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  Keep Up the Great Work!
                </h3>
                <p className="text-gray-700">
                  You've attended {pastSessions.length} session
                  {pastSessions.length !== 1 ? "s" : ""}. Every session is a
                  step forward on your wellness journey. We're proud of your
                  commitment to your mental health!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

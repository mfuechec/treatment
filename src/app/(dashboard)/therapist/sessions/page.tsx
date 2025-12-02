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
  Upload,
  AlertTriangle,
  User,
} from "lucide-react"

export default async function TherapistSessionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "THERAPIST") {
    redirect("/login")
  }

  // Fetch all sessions for this therapist
  const sessions = await prisma.session.findMany({
    where: {
      client: {
        therapistId: session.user.therapistId!,
      },
    },
    include: {
      client: {
        include: {
          user: true,
        },
      },
      riskFlags: {
        where: {
          acknowledged: false,
        },
      },
    },
    orderBy: {
      sessionDate: "desc",
    },
  })

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-2">
            View and manage all your therapy sessions
          </p>
        </div>
        <Button asChild>
          <Link href="/therapist/sessions/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Session
          </Link>
        </Button>
      </div>

      {/* Sessions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            All Sessions
          </CardTitle>
          <CardDescription>
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No sessions yet</p>
              <p className="text-sm mt-1 mb-4">
                Upload a transcript to get started
              </p>
              <Button asChild>
                <Link href="/therapist/sessions/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Session
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sessionItem) => (
                <div
                  key={sessionItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">
                        {sessionItem.client.displayName ||
                          sessionItem.client.user.email}
                      </p>
                      {getStatusBadge(sessionItem.status)}
                      {sessionItem.riskFlags.length > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {sessionItem.riskFlags.length} Risk
                          {sessionItem.riskFlags.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(sessionItem.sessionDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sessionItem.client.displayName || "Client"}
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
    </div>
  )
}

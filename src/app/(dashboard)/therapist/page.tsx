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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  ClipboardList,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react"

export default async function TherapistDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "THERAPIST") {
    redirect("/login")
  }

  // Fetch stats
  const [clientCount, sessionCount, planCount] = await Promise.all([
    prisma.client.count({
      where: {
        therapistId: session.user.therapistId!,
      },
    }),
    prisma.session.count({
      where: {
        client: {
          therapistId: session.user.therapistId!,
        },
      },
    }),
    prisma.treatmentPlanVersion.count({
      where: {
        treatmentPlan: {
          client: {
            therapistId: session.user.therapistId!,
          },
        },
        status: "DRAFT",
      },
    }),
  ])

  // Fetch recent sessions
  const recentSessions = await prisma.session.findMany({
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
    },
    orderBy: {
      sessionDate: "desc",
    },
    take: 5,
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-teal-200" />
            <span className="text-sm font-medium text-teal-100">AI-Powered Practice</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-teal-100 max-w-lg">
            Here&apos;s an overview of your practice. Use AI to generate treatment plans
            and streamline your client care.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Clients</p>
                <p className="text-3xl font-bold text-slate-800">{clientCount}</p>
                <p className="text-xs text-slate-400 mt-1">Active clients in your care</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-slate-800">{sessionCount}</p>
                <p className="text-xs text-slate-400 mt-1">Sessions conducted</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50">
                <ClipboardList className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Draft Plans</p>
                <p className="text-3xl font-bold text-slate-800">{planCount}</p>
                <p className="text-xs text-slate-400 mt-1">Pending review</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-800">Quick Actions</CardTitle>
          <CardDescription className="text-slate-500">
            Common tasks to help you manage your practice
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            asChild
            className="h-auto py-5 px-5 justify-start bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Link href="/therapist/sessions/upload">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 mr-4">
                <Upload className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-base">Upload Transcript</span>
                <span className="text-sm font-normal text-teal-100">
                  Generate a treatment plan from a session
                </span>
              </div>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-5 px-5 justify-start border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-200"
          >
            <Link href="/therapist/clients">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 mr-4">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-base text-slate-800">View Clients</span>
                <span className="text-sm font-normal text-slate-500">
                  Manage your client list
                </span>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">Recent Sessions</CardTitle>
              <CardDescription className="text-slate-500">
                Your latest client sessions
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
              <Link href="/therapist/sessions">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No sessions yet</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Upload a transcript to get started
              </p>
              <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Link href="/therapist/sessions/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Transcript
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((sessionItem: typeof recentSessions[number]) => (
                <div
                  key={sessionItem.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-100 transition-colors">
                      <Calendar className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {sessionItem.client.displayName || sessionItem.client.user.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(sessionItem.sessionDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                  >
                    <Link href={`/therapist/sessions/${sessionItem.id}`}>
                      View
                      <ArrowRight className="ml-1 h-4 w-4" />
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

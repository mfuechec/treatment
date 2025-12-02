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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  FileText,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  ClipboardList,
  Heart,
  Sparkles,
  Sun,
} from "lucide-react"

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/login")
  }

  // Fetch client's latest treatment plan version
  const latestVersion = await prisma.treatmentPlanVersion.findFirst({
    where: {
      treatmentPlan: {
        clientId: session.user.clientId!,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      treatmentPlan: true,
    },
  })

  const treatmentPlan = latestVersion ? {
    id: latestVersion.treatmentPlanId,
    status: latestVersion.status,
    createdAt: latestVersion.createdAt,
    diagnosis: (latestVersion.therapistContent as any)?.diagnosis || "Not specified",
    goals: (latestVersion.therapistContent as any)?.goals || null,
  } : null

  // Fetch upcoming/recent sessions
  const upcomingSession = await prisma.session.findFirst({
    where: {
      clientId: session.user.clientId!,
      sessionDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      sessionDate: "asc",
    },
  })

  const recentSessions = await prisma.session.findMany({
    where: {
      clientId: session.user.clientId!,
    },
    orderBy: {
      sessionDate: "desc",
    },
    take: 3,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 font-medium">
            Active
          </Badge>
        )
      case "DRAFT":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-medium">
            In Progress
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-0 font-medium">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-5 w-5 text-teal-200" />
            <span className="text-sm font-medium text-teal-100">Your Wellness Journey</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-teal-100 max-w-lg">
            We&apos;re here to support you every step of the way. Your progress matters,
            and every small step counts.
          </p>
        </div>
      </div>

      {/* Treatment Plan Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <FileText className="h-5 w-5 text-teal-600" />
                Your Treatment Plan
              </CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                Personalized plan created by your therapist
              </CardDescription>
            </div>
            {treatmentPlan && getStatusBadge(treatmentPlan.status)}
          </div>
        </CardHeader>
        <CardContent>
          {treatmentPlan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100">
                    <Target className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Focus Area</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {treatmentPlan.diagnosis}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100">
                    <Calendar className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Started</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {new Date(treatmentPlan.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {treatmentPlan.goals && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    Your Goals
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {treatmentPlan.goals}
                  </p>
                </div>
              )}

              <Button
                asChild
                className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Link href="/client/plan">
                  View Full Treatment Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No treatment plan yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Your therapist will create a personalized plan after your initial session
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Session */}
      {upcomingSession && (
        <Card className="border-0 shadow-sm border-l-4 border-l-teal-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <Calendar className="h-5 w-5 text-teal-600" />
              Next Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-teal-50/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    Upcoming Therapy Session
                  </p>
                  <p className="text-sm text-slate-600">
                    {new Date(upcomingSession.sessionDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Link href="/client/sessions">
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800">Recent Sessions</CardTitle>
              <CardDescription className="text-slate-500">
                Your therapy session history
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
              <Link href="/client/sessions">
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
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No sessions yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Your session history will appear here
              </p>
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
                      <ClipboardList className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        Therapy Session
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
                    <Link href={`/client/sessions/${sessionItem.id}`}>
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

      {/* Encouragement section */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shrink-0">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                You&apos;re doing great!
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Remember, healing is a journey, not a destination. Every session brings you
                closer to your goals. Keep up the wonderful work - your commitment to
                your wellness is inspiring!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import {
  Users,
  ArrowRight,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  AlertTriangle,
} from "lucide-react"

export default async function TherapistClientsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "THERAPIST") {
    redirect("/login")
  }

  // Fetch all clients with their session counts and latest session
  const clients = await prisma.client.findMany({
    where: {
      therapistId: session.user.therapistId!,
    },
    include: {
      user: true,
      sessions: {
        orderBy: {
          sessionDate: "desc",
        },
        take: 1,
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
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: {
      displayName: "asc",
    },
  })

  // Check for unacknowledged risk flags
  const clientsWithRiskFlags = await Promise.all(
    clients.map(async (client) => {
      const unacknowledgedRisks = await prisma.riskFlag.count({
        where: {
          session: {
            clientId: client.id,
          },
          acknowledged: false,
        },
      })
      return {
        ...client,
        hasUnacknowledgedRisks: unacknowledgedRisks > 0,
        unacknowledgedRiskCount: unacknowledgedRisks,
      }
    })
  )

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getPlanStatusBadge = (plan: any) => {
    if (!plan || !plan.versions || plan.versions.length === 0) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          <FileText className="h-3 w-3 mr-1" />
          No Plan
        </Badge>
      )
    }

    const latestVersion = plan.versions[0]
    switch (latestVersion.status) {
      case "DRAFT":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Draft Plan
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved Plan
          </Badge>
        )
      default:
        return <Badge variant="outline">{latestVersion.status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">
            Manage your client list and view their progress
          </p>
        </div>
        <Button asChild>
          <Link href="/therapist/clients/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-gray-500">
              Active in your care
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clients with Plans
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                clients.filter(
                  (c) =>
                    c.treatmentPlans.length > 0 &&
                    c.treatmentPlans[0].versions.length > 0
                ).length
              }
            </div>
            <p className="text-xs text-gray-500">
              Have treatment plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Risk Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                clientsWithRiskFlags.filter((c) => c.hasUnacknowledgedRisks)
                  .length
              }
            </div>
            <p className="text-xs text-gray-500">
              Clients with unacknowledged risks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients list */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            {clients.length} client{clients.length !== 1 ? "s" : ""} in your
            care
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No clients yet</p>
              <p className="text-sm mt-2 mb-6">
                Add your first client to get started
              </p>
              <Button asChild>
                <Link href="/therapist/clients/new">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Client
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientsWithRiskFlags.map((client) => {
                const latestSession = client.sessions[0]
                const latestPlan = client.treatmentPlans[0]

                return (
                  <div
                    key={client.id}
                    className="relative p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Risk alert indicator */}
                    {client.hasUnacknowledgedRisks && (
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant="destructive"
                          className="animate-pulse"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {client.unacknowledgedRiskCount} Risk
                          {client.unacknowledgedRiskCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-600 text-white font-semibold">
                          {getInitials(
                            client.displayName || client.displayName
                          )}
                        </AvatarFallback>
                      </Avatar>

                      {/* Client info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {client.displayName || client.displayName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Mail className="h-4 w-4" />
                          {client.user.email}
                        </div>

                        {/* Status indicators */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getPlanStatusBadge(latestPlan)}
                          <Badge variant="outline" className="bg-gray-50">
                            {client._count.sessions} Session
                            {client._count.sessions !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        {/* Latest session */}
                        {latestSession && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Last session:{" "}
                              {new Date(
                                latestSession.sessionDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* View button */}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                        >
                          <Link href={`/therapist/clients/${client.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

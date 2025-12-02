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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import {
  FileText,
  ArrowRight,
  Filter,
  Clock,
  CheckCircle,
} from "lucide-react"

export default async function TherapistPlansPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "THERAPIST") {
    redirect("/login")
  }

  const statusFilter = searchParams.status || "all"

  // Build query based on filter
  const whereClause: any = {
    client: {
      therapistId: session.user.therapistId!,
    },
  }

  if (statusFilter !== "all") {
    whereClause.status = statusFilter.toUpperCase()
  }

  // Fetch treatment plans with latest version
  const plans = await prisma.treatmentPlan.findMany({
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
  })

  // Filter by status if needed
  const filteredPlans = plans.filter((plan) => {
    if (statusFilter === "all") return true
    const latestVersion = plan.versions[0]
    return latestVersion?.status === statusFilter.toUpperCase()
  })

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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
          <p className="text-gray-600 mt-2">
            Manage and review treatment plans for your clients
          </p>
        </div>
      </div>

      {/* Filter section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Filter Plans</CardTitle>
            </div>
            <Select value={statusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="draft">Draft Only</SelectItem>
                <SelectItem value="approved">Approved Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Plans list */}
      <Card>
        <CardHeader>
          <CardTitle>All Treatment Plans</CardTitle>
          <CardDescription>
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No treatment plans found</p>
              <p className="text-sm mt-2">
                {statusFilter === "all"
                  ? "Upload a session transcript to generate a treatment plan"
                  : `No ${statusFilter} plans available`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => {
                const latestVersion = plan.versions[0]
                const therapistContent = latestVersion?.therapistContent as any

                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plan.client.displayName || plan.client.displayName}
                        </h3>
                        {latestVersion &&
                          getStatusBadge(latestVersion.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {plan.client.user.email}
                        </p>
                        <p>
                          <span className="font-medium">Last Updated:</span>{" "}
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </p>
                        {therapistContent?.diagnosis && (
                          <p className="col-span-2">
                            <span className="font-medium">Diagnosis:</span>{" "}
                            {typeof therapistContent.diagnosis === "string"
                              ? therapistContent.diagnosis
                              : therapistContent.diagnosis.primary || "N/A"}
                          </p>
                        )}
                      </div>
                      {latestVersion && (
                        <div className="mt-2 text-xs text-gray-500">
                          Version {latestVersion.versionNumber} •{" "}
                          {new Date(
                            latestVersion.createdAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/therapist/plans/${plan.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Plans</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                plans.filter((p) => p.versions[0]?.status === "DRAFT")
                  .length
              }
            </div>
            <p className="text-xs text-gray-500">
              Pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Plans
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                plans.filter((p) => p.versions[0]?.status === "APPROVED")
                  .length
              }
            </div>
            <p className="text-xs text-gray-500">
              Ready for clients
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Target,
  Lightbulb,
  ClipboardList,
  Heart,
  CheckCircle,
  Sparkles,
  Calendar,
  Info,
  Printer,
} from "lucide-react"

export default async function ClientTreatmentPlanPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLIENT") {
    redirect("/login")
  }

  // Fetch latest APPROVED treatment plan version
  const latestApprovedVersion = await prisma.treatmentPlanVersion.findFirst({
    where: {
      treatmentPlan: {
        clientId: session.user.clientId!,
      },
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      treatmentPlan: {
        include: {
          client: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!latestApprovedVersion) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Your Treatment Plan</h1>
          <p className="text-blue-100">
            Working together towards your wellness goals
          </p>
        </div>

        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Treatment Plan Available Yet
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your therapist is working on creating a personalized treatment
                plan for you. This will be available after your initial session
                and once your therapist has finalized the details.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-lg mx-auto">
                <div className="flex items-start gap-3 text-left">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      What to expect
                    </p>
                    <p className="text-sm text-gray-700">
                      Your treatment plan will outline what you're working on,
                      your goals, the approaches we'll use together, and
                      activities to practice between sessions. Check back after
                      your next session!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const clientContent = latestApprovedVersion.clientContent as any
  const clientName =
    latestApprovedVersion.treatmentPlan.client.displayName ||
    latestApprovedVersion.treatmentPlan.client.user.email.split('@')[0]

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-full">
      {/* Warm, encouraging header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white print:bg-blue-600">
        <h1 className="text-3xl font-bold mb-2">
          Hello {clientName.split(" ")[0]}!
        </h1>
        <p className="text-blue-100 text-lg">
          Here's your personalized treatment plan. We're in this together, and
          every step forward is progress worth celebrating.
        </p>
      </div>

      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Plan
        </Button>
      </div>

      {/* Main content card */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="pt-6 space-y-8">
          {/* What We're Working On */}
          {clientContent?.summary && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  What We're Working On
                </h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <p className="text-gray-900 text-lg leading-relaxed">
                  {clientContent.summary}
                </p>
              </div>
            </section>
          )}

          <Separator className="print:border-gray-300" />

          {/* Your Goals */}
          {Array.isArray(clientContent?.goals) && clientContent.goals.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
              </div>
              <p className="text-gray-600 mb-4">
                These are the things we're working toward together. Every small
                step counts!
              </p>
              <div className="space-y-3">
                {clientContent.goals.map((goal: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 bg-green-50 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-900 text-lg leading-relaxed">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Separator className="print:border-gray-300" />

          {/* What We're Doing Together */}
          {Array.isArray(clientContent?.interventions) &&
            clientContent.interventions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    What We're Doing Together
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  These are the approaches and techniques we'll use in our
                  sessions to help you reach your goals.
                </p>
                <div className="space-y-3">
                  {clientContent.interventions.map(
                    (intervention: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-900 text-lg leading-relaxed">
                            {intervention}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          <Separator className="print:border-gray-300" />

          {/* Your Homework */}
          {Array.isArray(clientContent?.homework) && clientContent.homework.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Practice Activities
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                These activities between sessions will help you build new skills
                and make progress toward your goals. Take them at your own pace!
              </p>
              <div className="space-y-3">
                {clientContent.homework.map((hw: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-lg font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-900 text-lg leading-relaxed pt-0.5">
                      {hw}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Separator className="print:border-gray-300" />

          {/* Your Strengths */}
          {Array.isArray(clientContent?.strengths) && clientContent.strengths.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Strengths
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                These are the amazing qualities you bring to this journey.
                Remember these when things feel tough!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientContent.strengths.map(
                  (strength: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-pink-50 rounded-lg border border-pink-200"
                    >
                      <Heart className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900 leading-relaxed">
                        {strength}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* Next Steps */}
          {clientContent?.nextSteps && (
            <>
              <Separator className="print:border-gray-300" />
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    What's Next
                  </h2>
                </div>
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {clientContent.nextSteps}
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Encouragement */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 print:border-gray-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-full flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  You're Doing Great!
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Remember, therapy is a journey, not a race. Every session and
                  every effort you make is a step toward feeling better. Be
                  patient and kind with yourself. You've got this, and we're
                  here to support you every step of the way.
                </p>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-sm text-gray-500 text-center pt-4 border-t">
            <Calendar className="h-4 w-4 inline mr-2" />
            Last updated:{" "}
            {new Date(latestApprovedVersion.createdAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Alert className="print:hidden">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-1">Have questions about your plan?</p>
          <p className="text-sm">
            Feel free to discuss any part of this treatment plan with your
            therapist during your next session. Your input and feedback are
            important!
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}

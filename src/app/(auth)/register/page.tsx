"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type Role = "THERAPIST" | "CLIENT"

interface Therapist {
  id: string
  userId: string
  licenseNumber: string | null
  specialty: string | null
}

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("CLIENT")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Client-specific fields
  const [displayName, setDisplayName] = useState("")
  const [selectedTherapistId, setSelectedTherapistId] = useState("")

  // Therapist-specific fields
  const [licenseNumber, setLicenseNumber] = useState("")
  const [specialty, setSpecialty] = useState("")

  // UI state
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loadingTherapists, setLoadingTherapists] = useState(false)

  // Load therapists when CLIENT role is selected
  useEffect(() => {
    if (role === "CLIENT") {
      loadTherapists()
    }
  }, [role])

  const loadTherapists = async () => {
    setLoadingTherapists(true)
    try {
      const response = await fetch("/api/therapists")
      if (response.ok) {
        const data = await response.json()
        setTherapists(data.therapists || [])
      }
    } catch (err) {
      console.error("Failed to load therapists:", err)
    } finally {
      setLoadingTherapists(false)
    }
  }

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (role === "CLIENT") {
      if (!displayName) {
        setError("Display name is required")
        return false
      }
      if (!selectedTherapistId) {
        setError("Please select a therapist")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const body = {
        email,
        password,
        role,
        ...(role === "CLIENT"
          ? { displayName, therapistId: selectedTherapistId }
          : { licenseNumber, specialty }),
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Zod validation errors
          const errorMessages = data.details
            .map((d: { message: string }) => d.message)
            .join(", ")
          setError(errorMessages)
        } else {
          setError(data.error || "Registration failed")
        }
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (err) {
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl bg-white">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
        <CardDescription className="text-slate-500">
          Join Tava Health to start your wellness journey
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-300 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Account created successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700 font-medium">I am a...</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
              disabled={isLoading}
            >
              <SelectTrigger id="role" className="h-11 rounded-xl border-slate-200 focus:border-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="CLIENT">Client seeking therapy</SelectItem>
                <SelectItem value="THERAPIST">Licensed therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl"
            />
          </div>

          {role === "CLIENT" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-700 font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="How your therapist will see you"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="therapist" className="text-slate-700 font-medium">Select Your Therapist</Label>
                <Select
                  value={selectedTherapistId}
                  onValueChange={setSelectedTherapistId}
                  disabled={isLoading || loadingTherapists}
                >
                  <SelectTrigger id="therapist" className="h-11 rounded-xl border-slate-200 focus:border-teal-500">
                    <SelectValue
                      placeholder={
                        loadingTherapists
                          ? "Loading therapists..."
                          : "Choose a therapist"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {therapists.map((therapist) => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        {therapist.specialty
                          ? `${therapist.specialty}${
                              therapist.licenseNumber
                                ? ` (${therapist.licenseNumber})`
                                : ""
                            }`
                          : `Therapist ${therapist.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {role === "THERAPIST" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-slate-700 font-medium">
                  License Number (Optional)
                </Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="Your professional license number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-slate-700 font-medium">Specialty (Optional)</Label>
                <Input
                  id="specialty"
                  type="text"
                  placeholder="e.g., CBT, Family Therapy, etc."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl"
                />
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-sm text-center text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

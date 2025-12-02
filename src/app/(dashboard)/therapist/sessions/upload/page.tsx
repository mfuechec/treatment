"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Calendar, User, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

interface Client {
  id: string
  displayName: string
  user: {
    email: string
  }
}

export default function TranscriptUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [selectedClient, setSelectedClient] = useState("")
  const [sessionDate, setSessionDate] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file")
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [transcriptText, setTranscriptText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Load clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true)
      try {
        const response = await fetch("/api/therapist/clients")
        if (response.ok) {
          const data = await response.json()
          setClients(data.clients || [])
        } else {
          setError("Failed to load clients")
        }
      } catch (err) {
        setError("Error loading clients")
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === "text/plain") {
      setTranscriptFile(file)
      setError("")
    } else {
      setError("Please upload a .txt file")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "text/plain") {
        setTranscriptFile(file)
        setError("")
      } else {
        setError("Please upload a .txt file")
      }
    }
  }

  const getTranscriptContent = async (): Promise<string> => {
    if (uploadMethod === "file" && transcriptFile) {
      return await transcriptFile.text()
    }
    return transcriptText
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (!selectedClient) {
      setError("Please select a client")
      return
    }
    if (!sessionDate) {
      setError("Please select a session date")
      return
    }
    if (uploadMethod === "file" && !transcriptFile) {
      setError("Please upload a transcript file")
      return
    }
    if (uploadMethod === "paste" && !transcriptText.trim()) {
      setError("Please paste transcript content")
      return
    }

    setIsSubmitting(true)

    try {
      const content = await getTranscriptContent()

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: selectedClient,
          sessionDate: new Date(sessionDate).toISOString(),
          transcript: content,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload transcript")
      }

      const data = await response.json()
      setSuccess(true)

      // Redirect to impressions form after brief success message
      setTimeout(() => {
        router.push(`/therapist/sessions/${data.session.id}/impressions`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload transcript")
    } finally {
      setIsSubmitting(false)
    }
  }

  const transcriptPreview = uploadMethod === "file" && transcriptFile
    ? `File: ${transcriptFile.name} (${(transcriptFile.size / 1024).toFixed(2)} KB)`
    : uploadMethod === "paste" && transcriptText
    ? `${transcriptText.substring(0, 200)}${transcriptText.length > 200 ? "..." : ""}`
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Session Transcript</h1>
        <p className="text-gray-600 mt-2">
          Upload a transcript to generate a comprehensive treatment plan
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Transcript uploaded successfully! Redirecting to impressions form...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>
              Provide details about the therapy session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">
                <User className="inline h-4 w-4 mr-2" />
                Client
              </Label>
              <Select value={selectedClient} onValueChange={setSelectedClient} disabled={loadingClients}>
                <SelectTrigger id="client">
                  <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.displayName || client.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session Date */}
            <div className="space-y-2">
              <Label htmlFor="sessionDate">
                <Calendar className="inline h-4 w-4 mr-2" />
                Session Date
              </Label>
              <Input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Transcript Input Methods */}
            <div className="space-y-2">
              <Label>
                <FileText className="inline h-4 w-4 mr-2" />
                Transcript
              </Label>

              <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "file" | "paste")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="paste">Paste Text</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-teal-500/5"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your transcript file here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-4">
                      Accepts .txt files only
                    </p>
                  </div>

                  {transcriptFile && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transcriptFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(transcriptFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTranscriptFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="paste" className="space-y-4">
                  <Textarea
                    placeholder="Paste the session transcript here..."
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  {transcriptText && (
                    <p className="text-xs text-gray-500">
                      {transcriptText.length} characters
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            {transcriptPreview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                    {transcriptPreview}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Continue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

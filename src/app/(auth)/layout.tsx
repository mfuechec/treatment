import { Sparkles, Heart, Shield } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tava Health</h1>
              <p className="text-teal-100 text-sm">AI Treatment Plans</p>
            </div>
          </div>

          {/* Main heading */}
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Empowering better<br />mental health care
          </h2>
          <p className="text-teal-100 text-lg max-w-md mb-12">
            AI-assisted treatment planning that helps therapists provide personalized,
            effective care for their clients.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">HIPAA Compliant</p>
                <p className="text-sm text-teal-100">Your data is secure and protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Client-Centered</p>
                <p className="text-sm text-teal-100">Plans written for real people</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-slate-50 p-6 sm:p-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tava Health</h1>
            <p className="text-xs text-slate-500">AI Treatment Plans</p>
          </div>
        </div>

        {children}

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-400 text-center max-w-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          This platform is intended for healthcare professionals.
        </p>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Session } from "next-auth"
import { cn } from "@/lib/utils"
import {
  Home,
  Users,
  FileText,
  ClipboardList,
  Menu,
  X,
  Sparkles
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  session: Session
}

const therapistLinks = [
  {
    href: "/therapist",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/therapist/clients",
    label: "Clients",
    icon: Users,
  },
  {
    href: "/therapist/sessions",
    label: "Sessions",
    icon: ClipboardList,
  },
  {
    href: "/therapist/plans",
    label: "Treatment Plans",
    icon: FileText,
  },
]

const clientLinks = [
  {
    href: "/client",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/client/plan",
    label: "My Treatment Plan",
    icon: FileText,
  },
  {
    href: "/client/sessions",
    label: "Sessions",
    icon: ClipboardList,
  },
]

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = session.user.role === "THERAPIST" ? therapistLinks : clientLinks

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-out shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-[72px] px-6 border-b border-slate-100">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Tava Health</h1>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">AI Treatment Plans</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-3 mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu
            </p>
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-teal-50 text-teal-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-teal-100"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-teal-600" : "text-slate-500"
                    )} />
                  </div>
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 text-white text-sm font-semibold">
                {session.user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                  {session.user.role === "THERAPIST" ? "Therapist" : "Client"}
                </p>
                <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
                  {session.user.email?.split("@")[0] || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

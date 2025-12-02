"use client"

import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, ChevronDown } from "lucide-react"
import NotificationDropdown from "@/components/notifications/NotificationDropdown"

interface HeaderProps {
  session: Session
}

export default function Header({ session }: HeaderProps) {
  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const portalTitle = session.user.role === "THERAPIST" ? "Provider Portal" : "My Wellness"

  return (
    <header className="h-[72px] bg-white border-b border-slate-200/80 flex items-center justify-between px-8">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
          {portalTitle}
        </h2>
        <p className="text-sm text-slate-500 -mt-0.5">
          {session.user.role === "THERAPIST"
            ? "Manage your practice and client care"
            : "Track your progress and wellness journey"
          }
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-xl">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-medium">
                  {getInitials(session.user.email || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800">
                  {session.user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-teal-600 font-medium capitalize">
                  {session.user.role.toLowerCase()}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-lg border-slate-200">
            <DropdownMenuLabel className="px-3 py-2">
              <div>
                <p className="font-medium text-slate-800">{session.user.email}</p>
                <p className="text-xs text-slate-500 capitalize mt-0.5">
                  {session.user.role.toLowerCase()} Account
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="cursor-pointer px-3 py-2.5 rounded-lg hover:bg-slate-50 focus:bg-slate-50">
              <User className="mr-3 h-4 w-4 text-slate-500" />
              <span className="text-slate-700">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem
              className="cursor-pointer px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

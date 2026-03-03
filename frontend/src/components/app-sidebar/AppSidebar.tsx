"use client"

import { Home, Users } from "lucide-react"

import { NavMain } from "@/components/app-sidebar/NavMain"
import { NavUser } from "@/components/app-sidebar/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useMemo } from "react"

export function AppSidebar() {
  const { user } = useAuth()

  const navItems = useMemo(() => {
    const items: { title: string; url: string; icon: typeof Home; isActive?: boolean }[] = [
      { title: "Home", url: "/", icon: Home },
    ]
    if (user?.role === "admin") {
      items.push({ title: "User Management", url: "/users", icon: Users })
    }
    return items
  }, [user?.role])

  const displayName = user?.email?.split("@")[0] ?? "User"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center gap-2 px-2 font-semibold">
          <span className="truncate">DataClipper</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser
          user={{
            name: displayName,
            email: user?.email ?? null,
            avatar: null,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

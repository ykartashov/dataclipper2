"use client"

import { Link, Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === "/") return "Home"
  if (pathname === "/users") return "User Management"
  return "App"
}

export function AppLayout() {
  const location = useLocation()
  const title = getBreadcrumbTitle(location.pathname)
  const isHome = location.pathname === "/"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className={!isHome ? "hidden md:block" : ""}>
                  {isHome ? (
                    <BreadcrumbPage>Home</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to="/">DataClipper</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isHome && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

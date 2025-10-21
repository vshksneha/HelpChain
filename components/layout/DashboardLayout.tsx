"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Home,
  Package,
  Users,
  Truck,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Plus,
  BarChart3,
  Wallet,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  organizationName?: string
  profileImage?: string
  walletAddress: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "donor" | "ngo" | "volunteer"
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3) // Mock notification count

  const detectedRole =
    userRole ||
    (pathname.includes("/donor")
      ? "donor"
      : pathname.includes("/ngo")
        ? "ngo"
        : pathname.includes("/volunteer")
          ? "volunteer"
          : "donor")

  useEffect(() => {
    // Get user data from localStorage or create demo user
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      const demoUser: User = {
        id: "demo-user",
        name: "Demo User",
        email: "demo@helpchain.org",
        role: detectedRole,
        organizationName: detectedRole === "ngo" ? "Demo NGO Organization" : undefined,
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      }
      setUser(demoUser)
    }
  }, [detectedRole])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: "Dashboard",
        href: `/dashboard/${detectedRole}`,
        icon: Home,
        current: pathname === `/dashboard/${detectedRole}`,
      },
    ]

    switch (detectedRole) {
      case "donor":
        return [
          ...baseItems,
          {
            name: "Browse Aid Packages",
            href: "/aid-packages",
            icon: Package,
            current: pathname.startsWith("/aid-packages"),
          },
          {
            name: "My Donations",
            href: "/dashboard/donor/donations",
            icon: Heart,
            current: pathname === "/dashboard/donor/donations",
          },
          {
            name: "Impact Tracking",
            href: "/dashboard/donor/impact",
            icon: BarChart3,
            current: pathname === "/dashboard/donor/impact",
          },
        ]

      case "ngo":
        return [
          ...baseItems,
          {
            name: "My Aid Packages",
            href: "/dashboard/ngo/packages",
            icon: Package,
            current: pathname === "/dashboard/ngo/packages",
          },
          {
            name: "Create Package",
            href: "/dashboard/ngo/create",
            icon: Plus,
            current: pathname === "/dashboard/ngo/create",
          },
          {
            name: "Analytics",
            href: "/dashboard/ngo/analytics",
            icon: BarChart3,
            current: pathname === "/dashboard/ngo/analytics",
          },
        ]

      case "volunteer":
        return [
          ...baseItems,
          {
            name: "Available Deliveries",
            href: "/dashboard/volunteer/available",
            icon: Package,
            current: pathname === "/dashboard/volunteer/available",
          },
          {
            name: "My Deliveries",
            href: "/dashboard/volunteer/deliveries",
            icon: Truck,
            current: pathname === "/dashboard/volunteer/deliveries",
          },
          {
            name: "Performance",
            href: "/dashboard/volunteer/performance",
            icon: BarChart3,
            current: pathname === "/dashboard/volunteer/performance",
          },
        ]

      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "donor":
        return "bg-primary text-primary-foreground"
      case "ngo":
        return "bg-secondary text-secondary-foreground"
      case "volunteer":
        return "bg-chart-4 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold text-foreground">HelpChain</span>
          </Link>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      item.current
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src={user.profileImage || "/placeholder.svg"} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.organizationName || user.name}</p>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getRoleColor(user.role)}`}>{user.role}</Badge>
              </div>
            </div>
          </div>

          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Wallet Connection Status */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="font-mono">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.organizationName || user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

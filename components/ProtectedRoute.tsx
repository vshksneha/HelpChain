"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("donor" | "ngo" | "volunteer")[]
}

function ProtectedRouteContent({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [demoUser, setDemoUser] = useState<any>(null)

  const isDemoMode = searchParams.get("demo") === "true"

  useEffect(() => {
    if (isDemoMode) {
      const mockUser = {
        id: "demo-user",
        email: "demo@helpchain.org",
        name: "Demo User",
        role: "donor" as const,
        walletAddress: "0x1234567890123456789012345678901234567890",
      }
      setDemoUser(mockUser)
      return
    }

    if (!loading) {
      if (!user) {
        router.push("/auth/login")
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/dashboard")
        return
      }
    }
  }, [user, loading, router, allowedRoles, isDemoMode])

  if (loading || (isDemoMode && !demoUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  const currentUser = isDemoMode ? demoUser : user

  if (!currentUser) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return null
  }

  return <>{children}</>
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
        </div>
      }
    >
      <ProtectedRouteContent {...props} />
    </Suspense>
  )
}

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, usersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "donor" | "ngo" | "volunteer"
  walletAddress?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  walletAddress: string | null
  isConnected: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isDemoMode = urlParams.get("demo") === "true"

    if (isDemoMode) {
      // Create mock demo user
      const demoUser: User = {
        id: "demo-donor-001",
        name: "Demo Donor",
        email: "demo@donor.com",
        role: "donor",
        walletAddress: "0x1234567890123456789012345678901234567890",
      }

      setUser(demoUser)
      setToken("demo-token")
      setWalletAddress(demoUser.walletAddress!)
      setIsConnected(true)
      setLoading(false)
      return
    }

    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    const storedWallet = localStorage.getItem("walletAddress")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    if (storedWallet) {
      setWalletAddress(storedWallet)
      setIsConnected(true)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
            setIsConnected(true)
            localStorage.setItem("walletAddress", accounts[0])
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "Success",
        description: "Login successful!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData)
      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))

      toast({
        title: "Success",
        description: "Registration successful!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "Error",
        description: "MetaMask is not installed. Please install MetaMask to continue.",
        variant: "destructive",
      })
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsConnected(true)
        localStorage.setItem("walletAddress", address)

        if (user) {
          try {
            await usersAPI.updateWalletAddress(address)
            setUser({ ...user, walletAddress: address })
            localStorage.setItem("user", JSON.stringify({ ...user, walletAddress: address }))
          } catch (error) {
            console.error("Error updating wallet address:", error)
          }
        }

        toast({
          title: "Success",
          description: "Wallet connected successfully!",
        })
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        toast({
          title: "Error",
          description: "Wallet connection rejected by user",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to connect wallet",
          variant: "destructive",
        })
      }
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
    toast({
      title: "Success",
      description: "Wallet disconnected",
    })
  }

  const value = {
    user,
    token,
    walletAddress,
    isConnected,
    login,
    register,
    logout,
    connectWallet,
    disconnectWallet,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

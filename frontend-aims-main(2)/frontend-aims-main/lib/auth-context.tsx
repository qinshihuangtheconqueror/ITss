"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: number
  email: string
  role: "product_manager"
  name: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("aims-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User
        setState({ user, isLoading: false })
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("aims-user")
        setState({ user: null, isLoading: false })
      }
    } else {
      setState({ user: null, isLoading: false })
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication logic - only for product manager
    if (email === "manager@aims.com" && password === "manager123") {
      const user: User = {
        id: 1,
        email: "manager@aims.com",
        role: "product_manager",
        name: "Product Manager",
      }
      setState({ user, isLoading: false })
      localStorage.setItem("aims-user", JSON.stringify(user))
      return { success: true, user }
    } else {
      return { success: false, error: "Invalid email or password" }
    }
  }

  const logout = () => {
    setState({ user: null, isLoading: false })
    localStorage.removeItem("aims-user")
  }

  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

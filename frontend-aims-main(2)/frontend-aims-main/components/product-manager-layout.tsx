"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ProductManagerSidebar from "@/components/product-manager-sidebar"

interface ProductManagerLayoutProps {
  children: React.ReactNode
}

export default function ProductManagerLayout({ children }: ProductManagerLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "product_manager")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== "product_manager") {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <ProductManagerSidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

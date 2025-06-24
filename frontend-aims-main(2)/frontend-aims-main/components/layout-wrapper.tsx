"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import Header from "@/components/header"
import ProductManagerHeader from "@/components/product-manager-header"
import Footer from "@/components/footer"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  const isProductManager = user?.role === "product_manager"

  return (
    <div className="flex flex-col min-h-screen">
      {isProductManager ? <ProductManagerHeader /> : <Header />}
      <main className="flex-1">{children}</main>
      {!isProductManager && <Footer />}
    </div>
  )
}

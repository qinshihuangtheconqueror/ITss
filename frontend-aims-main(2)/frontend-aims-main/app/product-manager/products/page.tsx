"use client"

import ProductManagerLayout from "@/components/product-manager-layout"
import ProductManagerDashboard from "@/components/product-manager-dashboard"

export default function ProductsManagementPage() {
  return (
    <ProductManagerLayout>
      <ProductManagerDashboard />
    </ProductManagerLayout>
  )
}

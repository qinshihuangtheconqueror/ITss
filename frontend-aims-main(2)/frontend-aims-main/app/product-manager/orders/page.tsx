"use client"

import ProductManagerLayout from "@/components/product-manager-layout"
import OrderManagementDashboard from "@/components/order-management-dashboard"

export default function OrderManagementPage() {
  return (
    <ProductManagerLayout>
      <OrderManagementDashboard />
    </ProductManagerLayout>
  )
}

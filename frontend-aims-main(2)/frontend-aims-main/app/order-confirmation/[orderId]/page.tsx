import { notFound } from "next/navigation"
import OrderConfirmation from "@/components/order-confirmation"
import { Suspense } from "react"
import OrderConfirmationSkeleton from "@/components/order-confirmation-skeleton"

interface OrderConfirmationPageProps {
  params: {
    orderId: string
  }
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const orderId = Number.parseInt(params.orderId)

  if (isNaN(orderId)) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<OrderConfirmationSkeleton />}>
        <OrderConfirmationContent orderId={orderId} />
      </Suspense>
    </div>
  )
}

async function OrderConfirmationContent({ orderId }: { orderId: number }) {
  return <OrderConfirmation orderId={orderId} />
}

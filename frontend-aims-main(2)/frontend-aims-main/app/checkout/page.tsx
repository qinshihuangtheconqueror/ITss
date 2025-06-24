import CheckoutForm from "@/components/checkout-form"
import { Suspense } from "react"
import CheckoutSkeleton from "@/components/checkout-skeleton"

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutForm />
      </Suspense>
    </div>
  )
}

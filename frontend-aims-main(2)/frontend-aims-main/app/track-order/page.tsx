import OrderTracking from "@/components/order-tracking"

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Track Your Order</h1>
        <OrderTracking />
      </div>
    </div>
  )
}

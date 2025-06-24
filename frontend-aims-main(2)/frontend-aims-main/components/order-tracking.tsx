"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { getOrderTracking, formatTrackingStatus, getStatusColor, formatTrackingDate } from "@/lib/tracking-utils"
import type { OrderTrackingInfo } from "@/lib/tracking-types"
import { Search, Package, MapPin, Clock, Truck, Phone, Mail, User, Zap } from "lucide-react"
import OrderCancellation from "./order-cancellation"

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("")
  const [orderInfo, setOrderInfo] = useState<OrderTrackingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCancellation, setShowCancellation] = useState(false)
  const { toast } = useToast()

  const handleFindOrder = async () => {
    if (!orderId.trim() || !/^\d+$/.test(orderId.trim())) {
      toast({
        title: "Order ID không hợp lệ",
        description: "Vui lòng nhập một Order ID chỉ chứa số.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate finding the order locally since there's no backend endpoint for it.
    // We just need to construct a mock object to proceed to cancellation.
    await new Promise((resolve) => setTimeout(resolve, 500))

    const parsedOrderId = Number.parseInt(orderId.trim())

    const mockOrderInfo: OrderTrackingInfo = {
      order_id: parsedOrderId,
      tracking_code: `AIMS-${parsedOrderId}-MOCK`, // Create a fake tracking code
      current_status: "pending", // Assume pending to allow cancellation
      order_date: new Date().toISOString(),
      can_cancel: true, // IMPORTANT: Must be true to show the cancel button
      order_details: {
        total_amount: 1, // Mock data, real value isn't critical here
        payment_method: "credit_card",
        delivery_address: "123 Mockingbird Lane",
        items: [],
      },
    }

    setOrderInfo(mockOrderInfo)
      toast({
      title: "Đã tìm thấy đơn hàng (Dữ liệu giả lập)",
      description: `Đã tải thông tin cho đơn hàng #${parsedOrderId}. Bạn có thể tiến hành hủy.`,
      })
      setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFindOrder()
    }
  }

  const handleCancellationSuccess = () => {
    setShowCancellation(false)
    // Update order status to cancelled
    if (orderInfo) {
      setOrderInfo({
        ...orderInfo,
        current_status: "cancelled",
        can_cancel: false,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Order ID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Nhập Order ID để hủy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex gap-2 mt-1">
              <Input
                id="order-id"
                placeholder="Ví dụ: 10001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleFindOrder} disabled={isLoading}>
                {isLoading ? "Đang tìm..." : "Tìm đơn hàng"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Information - Displayed after finding */}
      {orderInfo && (
        <div className="max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Order ID:</span>
                    <div className="text-muted-foreground">#{orderInfo.order_id}</div>
                  </div>
                  <div>
                    <span className="font-medium">Ngày đặt hàng (giả lập):</span>
                    <div className="text-muted-foreground">{formatTrackingDate(orderInfo.order_date)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái:</span>
                    <div>
                      <Badge variant="outline" className={getStatusColor(orderInfo.current_status)}>
                        {formatTrackingStatus(orderInfo.current_status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Phương thức thanh toán (giả lập):</span>
                    <div className="text-muted-foreground">
                      {orderInfo.order_details.payment_method === "credit_card"
                        ? "Credit Card"
                        : orderInfo.order_details.payment_method === "bank_transfer"
                          ? "Bank Transfer"
                          : "Cash on Delivery"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cancel Order Section */}
          {orderInfo.can_cancel && orderInfo.current_status === "pending" && (
            <div className="text-center mb-8">
              <Button variant="destructive" onClick={() => setShowCancellation(true)}>
                Hủy đơn hàng này
              </Button>
            </div>
          )}
           {orderInfo.current_status === "cancelled" && (
              <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
                Đơn hàng này đã được hủy.
            </div>
          )}
        </div>
      )}

      {/* Order Cancellation Modal */}
      {showCancellation && orderInfo && (
        <OrderCancellation
          orderInfo={orderInfo}
          onClose={() => setShowCancellation(false)}
          onSuccess={handleCancellationSuccess}
        />
      )}
    </div>
  )
}

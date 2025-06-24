"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { getOrderDetails, formatPaymentMethod, formatDate } from "@/lib/order-utils"
import { useToast } from "@/hooks/use-toast"
import { Package, Truck, MapPin, Phone, Mail, User, CheckCircle, XCircle, Zap } from "lucide-react"

interface OrderDetailViewProps {
  orderId: number | null
  open: boolean
  onClose: () => void
  onStatusChange?: (orderId: number, status: string) => void
}

export default function OrderDetailView({ orderId, open, onClose, onStatusChange }: OrderDetailViewProps) {
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && orderId) {
      loadOrderDetails()
    }
  }, [open, orderId])

  const loadOrderDetails = async () => {
    if (!orderId) return

    setIsLoading(true)
    try {
      const details = await getOrderDetails(orderId)
      setOrderDetails(details)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = () => {
    if (orderId && onStatusChange) {
      onStatusChange(orderId, "approved")
      onClose()
    }
  }

  const handleReject = () => {
    if (orderId && onStatusChange) {
      onStatusChange(orderId, "rejected")
      onClose()
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details {orderId && `#${orderId}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading order details...</p>
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge
                  variant="outline"
                  className={
                    orderDetails.order.status === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : orderDetails.order.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                  }
                >
                  {orderDetails.order.status.charAt(0).toUpperCase() + orderDetails.order.status.slice(1)}
                </Badge>
              </div>

              {orderDetails.order.status === "pending" && onStatusChange && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApprove}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Order
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReject}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Order
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Order ID:</span>
                    <div className="text-muted-foreground">#{orderDetails.order.order_id}</div>
                  </div>
                  <div>
                    <span className="font-medium">Order Date:</span>
                    <div className="text-muted-foreground">
                      {formatDate(orderDetails.transaction.transaction_datetime)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Payment Method:</span>
                    <div className="text-muted-foreground">
                      {formatPaymentMethod(orderDetails.transaction.payment_method)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total Amount:</span>
                    <div className="font-semibold">
                      {formatCurrency(orderDetails.order.total_after_vat + orderDetails.delivery.shipping_fee)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer & Delivery Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Customer & Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Customer Name</div>
                        <div className="text-muted-foreground">{orderDetails.delivery.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-muted-foreground">{orderDetails.delivery.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-muted-foreground">{orderDetails.delivery.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Delivery Address</div>
                        <div className="text-muted-foreground">
                          {orderDetails.delivery.address}, {orderDetails.delivery.province}
                        </div>
                      </div>
                    </div>

                    {orderDetails.delivery.shipping_message && (
                      <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm mt-2">
                        <div className="font-medium">Shipping Instructions:</div>
                        <div>{orderDetails.delivery.shipping_message}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {orderDetails.orderLines.map((line: any) => (
                    <div key={line.odline_id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{line.product.title}</span>
                          {line.rush_order_using && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Rush
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(line.product.price)} × {line.quantity}
                        </div>
                        {line.rush_order_using && line.delivery_time && (
                          <div className="text-xs text-orange-600 mt-1">Delivery time: {line.delivery_time}</div>
                        )}
                      </div>
                      <div className="font-semibold">{formatCurrency(line.total_fee)}</div>
                    </div>
                  ))}

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(orderDetails.order.total_before_vat - orderDetails.delivery.shipping_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VAT (10%):</span>
                      <span>{formatCurrency(orderDetails.order.vat)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping Fee:</span>
                      <span>{formatCurrency(orderDetails.delivery.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(orderDetails.order.total_after_vat + orderDetails.delivery.shipping_fee)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p>Order not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

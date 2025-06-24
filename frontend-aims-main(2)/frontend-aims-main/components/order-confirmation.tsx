"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { getOrderDetails, formatPaymentMethod, formatDate, getDeliveryFromLocalStorage, FinishOrder, getOrderFromLocalStorage } from "@/lib/order-utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Package, Truck, FileText, Clock, MapPin, Phone, Mail, User, Home, Zap } from "lucide-react"
import { useCart } from "@/lib/cart-context"


interface OrderConfirmationProps {
  orderId: number
}

export default function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const { state, getSelectedTotal, clearCart } = useCart()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true
    let isFetching = false

    const fetchOrderDetails = async () => {
      if (isFetching) return // CHẶN GỌI LẦN 2
      console.log(10)
      isFetching = true
      try {
        const details = await getOrderDetails(orderId)
        if (isMounted) {
          setOrderDetails(details)
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load order details",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          const order = getOrderFromLocalStorage()
          const delivery = getDeliveryFromLocalStorage()
          order.order_id = orderId
          await FinishOrder(order, delivery)
          clearCart()          
          setIsLoading(false)
        }
        isFetching = false
      }
    }

    fetchOrderDetails()

    return () => {
      isMounted = false
    }
  }, [orderId])

  if (isLoading) {
    return <div>Loading order details...</div>
  }

  if (!orderDetails) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-6">The order you are looking for does not exist.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    )
  }

  const { order, delivery, orderLines, transaction, invoice } = orderDetails
  const hasRushItems = orderLines.some((line: any) => line.rush_order_using)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been successfully placed and payment has been received.
        </p>
      </div>

      {/* Order and Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order ID:</span>
                <div className="text-muted-foreground">#{order.order_id}</div>
              </div>
              <div>
                <span className="font-medium">Order Date:</span>
                <div className="text-muted-foreground">{formatDate(transaction.transaction_datetime)}</div>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                    Pending
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium">Payment Method:</span>
                <div className="text-muted-foreground">{formatPaymentMethod(transaction.payment_method)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Invoice ID:</span>
                <div className="text-muted-foreground">#{invoice.invoice_id}</div>
              </div>
              <div>
                <span className="font-medium">Transaction ID:</span>
                <div className="text-muted-foreground">#{transaction.transaction_id}</div>
              </div>
              <div>
                <span className="font-medium">Amount:</span>
                <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
              </div>
              <div>
                <span className="font-medium">Transaction Date:</span>
                <div className="text-muted-foreground">{formatDate(transaction.transaction_datetime)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Recipient</div>
                  <div className="text-muted-foreground">{delivery.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-muted-foreground">{delivery.phone}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-muted-foreground">{delivery.email}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Delivery Address</div>
                  <div className="text-muted-foreground">
                    {delivery.address}, {delivery.province}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Estimated Delivery</div>
                  <div className="text-muted-foreground">
                    {hasRushItems ? (
                      <span>
                        Rush items: 2 hours <br />
                        Regular items: 3-5 business days
                      </span>
                    ) : (
                      <span>3-5 business days</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-8">
        <CardHeader>
          {/* <CardTitle>Order Items</CardTitle> */}
          <CardTitle>Detail Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* {orderLines.map((line: any) => (
              <div key={line.odline_id} className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{line.product_id}</span>
                    {line.rush_order_using && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Rush
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {line.product_id}
                  </div>
                  {line.rush_order_using && line.delivery_time && (
                    <div className="text-xs text-orange-600 mt-1">Delivery time: {line.delivery_time}</div>
                  )}
                </div>
                <div className="font-semibold">{formatCurrency(line.total_Fee)}</div>
              </div>
            ))} */}

            <Separator />

            {/* Order Totals */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.total_after_VAT - delivery.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT (10%):</span>
                <span>{formatCurrency(order.vat)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping Fee:</span>
                <span>{formatCurrency(delivery.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatCurrency(order.total_after_VAT)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          A confirmation email has been sent to <span className="font-medium">{delivery.email}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <Link href={`/orders/${order.order_id}`}>
            <Button className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Track Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

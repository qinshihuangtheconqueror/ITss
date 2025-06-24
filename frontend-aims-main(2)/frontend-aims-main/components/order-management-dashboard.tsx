"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ShoppingBag, Eye, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import OrderDetailView from "@/components/order-detail-view"
import { fetchOrders } from "@/lib/order-manager-utils"

export default function OrderManagementDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const result = await fetchOrders()
      setOrders(result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewOrder = (orderId: number) => {
    setViewingOrderId(orderId)
    setShowOrderDetail(true)
  }

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // In a real application, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setOrders(orders.map((order) => (order.order_id === orderId ? { ...order, status: newStatus } : order)))

      toast({
        title: `Order ${newStatus === "approved" ? "Approved" : "Rejected"}`,
        description: `Order #${orderId} has been ${newStatus === "approved" ? "approved" : "rejected"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${newStatus === "approved" ? "approve" : "reject"} order`,
        variant: "destructive",
      })
    }
  }

  const handleDetailClose = () => {
    setShowOrderDetail(false)
    setViewingOrderId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.order_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">#{order.order_id}</td>
                      <td className="py-3 px-4">{order.customer_name}</td>
                      <td className="py-3 px-4">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(order.total_amount)}</td>
                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order.order_id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>

                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderStatusChange(order.order_id, "approved")}
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderStatusChange(order.order_id, "rejected")}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailView orderId={viewingOrderId} open={showOrderDetail} onClose={handleDetailClose} />
    </div>
  )
}

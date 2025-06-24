import type { OrderTrackingInfo, CancellationRequest } from "./tracking-types"
import { api } from "./api"

// Mock function to get order tracking information
export async function getOrderTracking(trackingCode: string): Promise<OrderTrackingInfo | null> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Validate tracking code format (should be like "AIMS-12345-ABC")
  const trackingCodeRegex = /^AIMS-\d{5}-[A-Z]{3}$/
  if (!trackingCodeRegex.test(trackingCode)) {
    return null
  }

  // Extract order ID from tracking code
  const orderIdMatch = trackingCode.match(/AIMS-(\d{5})-[A-Z]{3}/)
  if (!orderIdMatch) {
    return null
  }

  const orderId = Number.parseInt(orderIdMatch[1])

  // Mock tracking data with only 4 statuses
  const mockTrackingInfo: OrderTrackingInfo = {
    order_id: orderId,
    tracking_code: trackingCode,
    current_status: "pending",
    order_date: "2024-01-15T10:30:00Z",
    can_cancel: true, // Can only cancel if status is pending
    order_details: {
      total_amount: 1672000,
      payment_method: "credit_card",
      delivery_address: "123 Nguyen Hue Street, District 1, TP Hồ Chí Minh",
      items: [
        {
          product_id: 1,
          title: "Product 1",
          quantity: 1,
          price: 500000,
          rush_order: false,
        },
        {
          product_id: 2,
          title: "Product 2",
          quantity: 2,
          price: 500000,
          rush_order: true,
        },
      ],
    },
  }

  return mockTrackingInfo
}

// Real API function to cancel order - integrated with Java Spring backend
export async function cancelOrder(
  cancellationRequest: Pick<CancellationRequest, "order_id" | "tracking_code">,
): Promise<{
  success: boolean
  message: string
  refund_amount?: number
  refund_method?: string
  updated_status?: string
  vnp_ResponseCode?: string
  vnp_Message?: string
}> {
  try {
    // Call the real backend API
    const response = await api.post(`/api/order/cancel?order_id=${cancellationRequest.order_id}`, {})
    
    // Check if the response indicates success
    if (response && response.vnp_ResponseCode === "00") {
      return {
        success: true,
        message: "Đơn hàng đã được hủy thành công. Hoàn tiền sẽ được xử lý trong 3-5 ngày làm việc.",
        updated_status: "cancelled",
        vnp_ResponseCode: response.vnp_ResponseCode,
        vnp_Message: response.vnp_Message,
        refund_amount: response.vnp_Amount ? parseInt(response.vnp_Amount) / 100 : undefined, // VNPay amount is in VND * 100
        refund_method: "VNPay Refund"
      }
    } else {
      return {
        success: false,
        message: response.vnp_Message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.",
        vnp_ResponseCode: response.vnp_ResponseCode,
        vnp_Message: response.vnp_Message
      }
    }
  } catch (error: any) {
    console.error("Error cancelling order:", error)
    
    // Handle specific error cases
    if (error.message?.includes("Order not found")) {
      return {
        success: false,
        message: "Không tìm thấy đơn hàng."
      }
    }
    
    if (error.message?.includes("Order cannot be cancelled")) {
    return {
      success: false,
        message: "Đơn hàng không thể hủy. Chỉ có thể hủy đơn hàng đang chờ xử lý."
    }
  }

    if (error.message?.includes("No transaction found")) {
      return {
        success: false,
        message: "Không tìm thấy giao dịch thanh toán cho đơn hàng này. Không thể hoàn tiền."
      }
    }
    
    return {
      success: false,
      message: "Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại sau."
    }
  }
}

// Update formatTrackingStatus to only handle the 4 statuses
export function formatTrackingStatus(status: string): string {
  switch (status) {
    case "pending":
      return "Pending"
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

// Update getStatusColor to only handle the 4 statuses
export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "cancelled":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Format date for display
export function formatTrackingDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

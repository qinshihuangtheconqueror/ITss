import { api } from "./api"
import type { DeliveryInformation, CheckoutFormData, ShippingCalculation } from "./checkout-types"
import { SubmitDeliveryInfo } from "./delivery-utils"
import { getOrderFromLocalStorage, saveDeliveryToLocalStorage, saveOrderToLocalStorage } from "./order-utils"

// Calculate shipping fees based on new rules
export async function calculateShippingFees(
  province: string,
  cartItems: Array<{
    product: any
    quantity: number
    selected: boolean
  }>,
  orderLines: Array<{
    product_id: number
    quantity: number
    rush_order: boolean // Changed from rush_order_using to rush_order
  }>,
): Promise<ShippingCalculation> {


  let order = getOrderFromLocalStorage()
   
  if (order && order.orderLineList) {
    order.orderLineList = order.orderLineList.map((orderline: any) => {
      // Tìm orderLine tương ứng từ tham số orderLines
      const matchingOrderLine = orderLines.find(
        line => line.product_id === orderline.product_id
      )
      // Nếu tìm thấy, cập nhật rush_order_using
      if (matchingOrderLine) {
        return {
          ...orderline,
          rush_order_using: matchingOrderLine.rush_order
        }
      }

      // Nếu không tìm thấy, giữ nguyên orderline
      return orderline
    })
  }

  const response = await api.post("/recalculate",
    {
      province: province,
      order: order
    }
  )
  saveOrderToLocalStorage(order)

  return {
    regularShipping: response.regularShipping,
    rushShipping: response.rushShipping,
    freeShippingDiscount: 25000,
    totalShipping: response.totalShipping,
  }
}

// Calculate shipping by weight and province
function calculateShippingByWeight(province: string, weight: number): number {
  const isMajorCity = ["Hà Nội", "TP Hồ Chí Minh"].includes(province)

  if (isMajorCity) {
    // Hanoi/HCMC: 22,000 VND for first 3kg
    if (weight <= 3) {
      return 22000
    }
    // Additional 2,500 VND for each 0.5kg above 3kg
    const additionalWeight = weight - 3
    const additionalUnits = Math.ceil(additionalWeight / 0.5)
    return 22000 + additionalUnits * 2500
  } else {
    // Other provinces: 30,000 VND for first 0.5kg
    if (weight <= 0.5) {
      return 30000
    }
    // Additional 2,500 VND for each 0.5kg above 0.5kg
    const additionalWeight = weight - 0.5
    const additionalUnits = Math.ceil(additionalWeight / 0.5)
    return 30000 + additionalUnits * 2500
  }
}

// Create delivery information
export async function createDeliveryInformation(
  deliveryData: Omit<DeliveryInformation, "delivery_id">,
): Promise<number> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // This would be replaced with actual API call
  console.log("Creating delivery information:", deliveryData)

  // Return mock delivery_id
  return Math.floor(Math.random() * 10000) + 1
}

// Process complete checkout - simplified to only handle delivery info
export async function processCheckout(
  checkoutData: CheckoutFormData,
  shippingCalculation: ShippingCalculation,
): Promise<{ success: boolean; orderId?: number; error?: string; clearCart?: boolean }> {
  try {
    const response = await SubmitDeliveryInfo({
      ...checkoutData.deliveryInfo,
      delivery_id: 0,
      delivery_fee: shippingCalculation.totalShipping,
    })
    
    console.log(response.delivery_information)
    saveDeliveryToLocalStorage(response.delivery_information)
    // Send order data to backend for Order and OrderLine creation
    const orderPayload = {
      order_id: 0,
      delivery_id: 0,
      status: checkoutData.status,
      total_after_VAT: checkoutData.total_after_VAT + shippingCalculation.totalShipping,
      total_before_VAT: checkoutData.total_before_VAT + shippingCalculation.totalShipping,
      vat: checkoutData.vat,
      orderLineList: checkoutData.orderLineList,
    }

    saveOrderToLocalStorage(orderPayload)

    return { success: true, clearCart: true }
  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, error: "Failed to process checkout" }
  }
}

export async function VnpayTrigger(amount: number) {
  const response = await api.post("/api/payment",
    {
      amount: amount,
      bankCode: "NCB",
      language: "vn",
      vnp_Version: "2.1.0"
    }
  )
  return response.paymentUrl
}

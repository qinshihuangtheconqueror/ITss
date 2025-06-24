import type { Transaction, Invoice } from "./order-types"
import type { Order, DeliveryInformation, Order_server } from "./checkout-types"
import { api } from "./api"
import { CartItem } from "./cart-context"

// Mock function to get order details
export async function getOrderDetails(orderId: number): Promise<{
  order: Order
  delivery: DeliveryInformation
  orderLines: any[]
  transaction: Transaction
  invoice: Invoice
} | null> {
  // Simulate API call

  
  // This would be replaced with actual API call
  try {
      let order = getOrderFromLocalStorage()
      let delivery = getDeliveryFromLocalStorage()
      let orderLines = order.orderLineList
      order.order_id = orderId
    // Mock data
    // const order: Order = {
    //   order_id: orderId,
    //   delivery_id: 1000 + orderId,
    //   total_before_vat: order.total_before_vat,
    //   total_after_vat:  order.total_after_vat,
    //   status: "pending",
    //   vat: 150000,
    // }

    //  const delivery: DeliveryInformation = {
    //   delivery_id: 1000 + orderId,
    //   name: "Nguyen Van A",
    //   phone: "0912345678",
    //   email: "nguyenvana@example.com",
    //   address: "123 Nguyen Hue Street, District 1",
    //   province: "TP Hồ Chí Minh",
    //   shipping_fee: 22000,
    // }

    // const orderLines = [
    //   {
    //     odline_id: 5001,
    //     order_id: orderId,
    //     product_id: 1,
    //     status: "pending",
    //     quantity: 1,
    //     total_fee: 500000,
    //     rush_order_using: false,
    //     product: {
    //       product_id: 1,
    //       title: "Product 1",
    //       type: "book",
    //       price: 500000,
    //     },
    //   },
    //   {
    //     odline_id: 5002,
    //     order_id: orderId,
    //     product_id: 2,
    //     status: "pending",
    //     quantity: 2,
    //     total_fee: 1000000,
    //     rush_order_using: true,
    //     delivery_time: "14:00 - 16:00",
    //     product: {
    //       product_id: 2,
    //       title: "Product 2",
    //       type: "dvd",
    //       price: 500000,
    //     },
    //   },
    // ]

    const transaction: Transaction = {
      transaction_id: 3000 + orderId,
      transaction_datetime: new Date().toISOString(),
      transaction_content: "Payment for order #" + orderId,
      amount: order.total_after_VAT, // Total after VAT + shipping
      payment_method: "credit_card",
    }


    const invoice: Invoice = {
      invoice_id: 4000 + orderId,
      order_id: orderId,
      transaction_id: 3000 + orderId,
      description: "Invoice for order #" + orderId,
    }

    console.log(order)
    console.log(delivery)


    return {
      order,
      delivery,
      orderLines,
      transaction,
      invoice,
    }
  } catch (error) {
    console.error("Error fetching order details:", error)
    return null
  }
}

// Format payment method for display
export function formatPaymentMethod(method: string): string {
  switch (method) {
    case "cod":
      return "Cash on Delivery (COD)"
    case "momo":
      return "MoMo E-Wallet"
    case "vnpay":
      return "VNPay"
    default:
      return method
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export async function createOrder(cartItems: Omit<CartItem, "selected">[]) {
  const cart = {
    listofProducts: cartItems
  }
  const response = await api.post("/placeorder", cart)
  return response.order
}


export function saveOrderToLocalStorage(order: any) {
  localStorage.setItem("order", JSON.stringify(order))
}

export function getOrderFromLocalStorage() {
  const order = localStorage.getItem("order")
  return order ? JSON.parse(order) : null
}

export function removeOrderFromLocalStorage() {
  localStorage.removeItem("order")
}

export function saveDeliveryToLocalStorage(delivery: DeliveryInformation) {
  localStorage.setItem("delivery", JSON.stringify(delivery))
}

export function getDeliveryFromLocalStorage() {
  const delivery = localStorage.getItem("delivery")
  return delivery ? JSON.parse(delivery) : null
}

export function removeDeliveryFromLocalStorage() {
  localStorage.removeItem("delivery")
}

export async function FinishOrder(order : any, deliveryInfo : DeliveryInformation) {
  
    const response = await api.post("/finish-order", {
      order : order, 
      deliveryInformation : deliveryInfo})
    return response
}




// Transaction interface
export interface Transaction {
  transaction_id: number
  transaction_datetime: string
  transaction_content: string
  amount: number
  payment_method: string
}

// Invoice interface
export interface Invoice {
  invoice_id: number
  order_id: number
  transaction_id: number
  description: string
}

// Order status types
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

// Payment method types
export type PaymentMethod = "cod" | "momo" | "vnpay"

// Payment status types
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

// Mock function to fetch orders for the product manager
export async function fetchOrders(): Promise<any[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock data
  const mockOrders = [
    {
      order_id: 10001,
      customer_name: "Nguyen Van A",
      order_date: "2024-06-01T10:15:00Z",
      total_amount: 1672000,
      status: "pending",
      payment_method: "credit_card",
    },
    {
      order_id: 10002,
      customer_name: "Tran Thi B",
      order_date: "2024-06-02T14:30:00Z",
      total_amount: 890000,
      status: "approved",
      payment_method: "momo",
    },
    {
      order_id: 10003,
      customer_name: "Le Van C",
      order_date: "2024-06-03T09:45:00Z",
      total_amount: 1250000,
      status: "rejected",
      payment_method: "cod",
    },
    {
      order_id: 10004,
      customer_name: "Pham Thi D",
      order_date: "2024-06-04T16:20:00Z",
      total_amount: 750000,
      status: "pending",
      payment_method: "vnpay",
    },
    {
      order_id: 10005,
      customer_name: "Hoang Van E",
      order_date: "2024-06-05T11:10:00Z",
      total_amount: 2100000,
      status: "approved",
      payment_method: "credit_card",
    },
    {
      order_id: 10006,
      customer_name: "Nguyen Thi F",
      order_date: "2024-06-06T13:40:00Z",
      total_amount: 980000,
      status: "pending",
      payment_method: "cod",
    },
    {
      order_id: 10007,
      customer_name: "Tran Van G",
      order_date: "2024-06-07T10:30:00Z",
      total_amount: 1450000,
      status: "approved",
      payment_method: "momo",
    },
    {
      order_id: 10008,
      customer_name: "Le Thi H",
      order_date: "2024-06-08T15:15:00Z",
      total_amount: 670000,
      status: "pending",
      payment_method: "vnpay",
    },
  ]

  return mockOrders
}

// Mock function to update order status
export async function updateOrderStatus(orderId: number, status: string): Promise<boolean> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real application, this would update the database
  console.log(`Order ${orderId} status updated to ${status}`)

  return true
}

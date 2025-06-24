// Delivery Information interface
export interface DeliveryInformation {
  delivery_id?: number
  name: string
  phone: string
  email: string
  address: string
  province: string
  delivery_message?: string
  delivery_fee: number
}


export interface Order {
  order_id?: number
  delivery_id: number
  total_before_vat: number
  total_after_vat: number
  status: string
  vat: number
}

export interface Order_server{
  order_id: number,
  delivery_id: number,
  total_before_vat: number,
  total_after_vat: number,
  status: string,
  vat: number,
  orderlineList : any[]
}

// Simplified checkout form data interface for frontend
export interface CheckoutFormData {
  deliveryInfo: Omit<DeliveryInformation, "delivery_id" | "delivery_fee">
  orderLineList: Array<{
    product_id: number
    status: "pending"
    quantity: number
    total_Fee: number
    delivery_time: string | null
    instructions: string | null
    rush_order: boolean
  }>
  paymentMethod: "cod" | "momo" | "vnpay"
  // Order totals for backend
  status: "pending"
  total_after_VAT: number
  total_before_VAT: number
  vat: number
}

// Shipping calculation result
export interface ShippingCalculation {
  regularShipping: number
  rushShipping: number
  freeShippingDiscount: number
  totalShipping: number
}

// Province options for Vietnam
export const VIETNAM_PROVINCES = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
  "Phú Yên",
  "Cần Thơ",
  "Đà Nẵng",
  "Hải Phòng",
  "Hà Nội",
  "TP Hồ Chí Minh",
]

// Time slots for rush delivery (2-hour windows)
export const RUSH_DELIVERY_TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
]

// Common product interface
export interface Product {
  product_id: number
  title: string
  type: "book" | "dvd" | "cd"
  price: number
  weight: number
  rush_order_supported: boolean
  image_url: string
  barcode: string
  import_date: string
  introduction: string
  quantity: number
}

// Book specific interface
export interface Book extends Product {
  book_id: number
  genre: string
  page_count: number
  publication_date: string
  authors: string
  publishers: string
  cover_type: string
}

// DVD specific interface
export interface DVD extends Product {
  dvd_id: number
  release_date: string
  dvd_type: string
  genre: string
  studio: string
  director: string
}

// CD specific interface
export interface CD extends Product {
  cd_id: number
  track_list: string
  genre: string
  record_label: string
  artists: string
  release_date: string
}

// Pagination interface
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

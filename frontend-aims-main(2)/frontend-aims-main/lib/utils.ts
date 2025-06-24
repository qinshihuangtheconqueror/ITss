import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "./api"
import { type } from "os"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in Vietnam Dong
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price)
}

// Mock data function to simulate fetching products
export async function fetchProducts(
  page = 1,
  limit = 10,
): Promise<{
  products: Product[]
  totalPages: number
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  let response = await api.get("/product/all");
  // Specific mock products with realistic data
  const mockProducts: Product[] = [
    // Books (5 products)
    {
      product_id: 1,
      title: "The Great Gatsby",
      type: "book",
      price: 250000,
      weight: 0.3,
      rush_order_supported: true,
      image_url: "/images/the-great-gatsby.png",
      barcode: "BOOK-000001",
      import_date: "2024-01-15",
      introduction:
        "A classic American novel by F. Scott Fitzgerald, exploring themes of wealth, love, and the American Dream in the Jazz Age.",
      quantity: 25,
    },
    {
      product_id: 2,
      title: "To Kill a Mockingbird",
      type: "book",
      price: 280000,
      weight: 0.35,
      rush_order_supported: true,
      image_url: "/images/to-kill-a-mockingbird.png",
      barcode: "BOOK-000002",
      import_date: "2024-01-20",
      introduction:
        "Harper Lee's Pulitzer Prize-winning novel about racial injustice and childhood innocence in the American South.",
      quantity: 18,
    },
    {
      product_id: 3,
      title: "1984",
      type: "book",
      price: 320000,
      weight: 0.4,
      rush_order_supported: false,
      image_url: "/images/1984.png",
      barcode: "BOOK-000003",
      import_date: "2024-02-01",
      introduction:
        "George Orwell's dystopian masterpiece about totalitarianism, surveillance, and the power of language.",
      quantity: 12,
    },
    {
      product_id: 4,
      title: "Pride and Prejudice",
      type: "book",
      price: 290000,
      weight: 0.38,
      rush_order_supported: true,
      image_url: "/images/pride-and-prejudice.png",
      barcode: "BOOK-000004",
      import_date: "2024-02-10",
      introduction:
        "Jane Austen's beloved romance novel about Elizabeth Bennet and Mr. Darcy, exploring love, class, and social expectations.",
      quantity: 22,
    },
    {
      product_id: 5,
      title: "The Catcher in the Rye",
      type: "book",
      price: 270000,
      weight: 0.32,
      rush_order_supported: true,
      image_url: "/images/the-catcher-in-the-rye.png",
      barcode: "BOOK-000005",
      import_date: "2024-02-15",
      introduction:
        "J.D. Salinger's coming-of-age novel following teenager Holden Caulfield's experiences in New York City.",
      quantity: 15,
    },

    // DVDs (5 products)
    {
      product_id: 6,
      title: "The Shawshank Redemption",
      type: "dvd",
      price: 450000,
      weight: 0.15,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "DVD-000001",
      import_date: "2024-01-25",
      introduction:
        "Frank Darabont's acclaimed drama starring Tim Robbins and Morgan Freeman. A story of hope and friendship in prison.",
      quantity: 30,
    },
    {
      product_id: 7,
      title: "The Godfather",
      type: "dvd",
      price: 520000,
      weight: 0.18,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "DVD-000002",
      import_date: "2024-02-05",
      introduction:
        "Francis Ford Coppola's epic crime saga following the Corleone family. Starring Marlon Brando and Al Pacino.",
      quantity: 20,
    },
    {
      product_id: 8,
      title: "Pulp Fiction",
      type: "dvd",
      price: 480000,
      weight: 0.16,
      rush_order_supported: false,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "DVD-000003",
      import_date: "2024-02-12",
      introduction:
        "Quentin Tarantino's nonlinear crime film with an ensemble cast including John Travolta and Samuel L. Jackson.",
      quantity: 8,
    },
    {
      product_id: 9,
      title: "The Dark Knight",
      type: "dvd",
      price: 550000,
      weight: 0.17,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "DVD-000004",
      import_date: "2024-02-18",
      introduction: "Christopher Nolan's Batman sequel featuring Heath Ledger's iconic performance as the Joker.",
      quantity: 25,
    },
    {
      product_id: 10,
      title: "Forrest Gump",
      type: "dvd",
      price: 420000,
      weight: 0.14,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "DVD-000005",
      import_date: "2024-02-22",
      introduction:
        "Robert Zemeckis's heartwarming drama starring Tom Hanks as a man who witnesses key historical events.",
      quantity: 35,
    },

    // CDs (5 products)
    {
      product_id: 11,
      title: "Abbey Road",
      type: "cd",
      price: 380000,
      weight: 0.12,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "CD-000001",
      import_date: "2024-01-30",
      introduction: "The Beatles' iconic 1969 album featuring classics like 'Come Together' and 'Here Comes the Sun'.",
      quantity: 40,
    },
    {
      product_id: 12,
      title: "Thriller",
      type: "cd",
      price: 420000,
      weight: 0.13,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "CD-000002",
      import_date: "2024-02-08",
      introduction:
        "Michael Jackson's best-selling album of all time, featuring hits like 'Billie Jean' and 'Beat It'.",
      quantity: 28,
    },
    {
      product_id: 13,
      title: "The Dark Side of the Moon",
      type: "cd",
      price: 450000,
      weight: 0.14,
      rush_order_supported: false,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "CD-000003",
      import_date: "2024-02-14",
      introduction:
        "Pink Floyd's progressive rock masterpiece exploring themes of conflict, greed, and mental illness.",
      quantity: 16,
    },
    {
      product_id: 14,
      title: "Back in Black",
      type: "cd",
      price: 390000,
      weight: 0.12,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "CD-000004",
      import_date: "2024-02-20",
      introduction:
        "AC/DC's hard rock album featuring powerful tracks like 'Hells Bells' and the title track 'Back in Black'.",
      quantity: 32,
    },
    {
      product_id: 15,
      title: "Hotel California",
      type: "cd",
      price: 410000,
      weight: 0.13,
      rush_order_supported: true,
      image_url: "/placeholder.svg?height=400&width=300",
      barcode: "CD-000005",
      import_date: "2024-02-25",
      introduction: "The Eagles' classic rock album featuring the legendary title track and 'New Kid in Town'.",
      quantity: 24,
    },
  ]

  // Calculate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedProducts = response.slice(startIndex, endIndex)
  const totalPages = Math.ceil(response.length / limit)
  
  return {
    products: paginatedProducts,
    totalPages,
  }
}

// Fetch individual product by ID with enhanced details
export async function fetchProductById(id: number,type: string): Promise<Product | Book | DVD | CD | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  let response = await api.get(`/product/all-detail/${id}?type=${type}`);

  const productDetails = {
    1: {
      type: "book",
      book_id: 1,
      genre: "Classic Literature",
      page_count: 180,
      publication_date: "1925-04-10",
      authors: "F. Scott Fitzgerald",
      publishers: "Charles Scribner's Sons",
      cover_type: "paperback" as const,
    },
    2: {
      type: "book",
      book_id: 2,
      genre: "Fiction",
      page_count: 281,
      publication_date: "1960-07-11",
      authors: "Harper Lee",
      publishers: "J.B. Lippincott & Co.",
      cover_type: "hardcover" as const,
    },
    3: {
      type: "book",
      book_id: 3,
      genre: "Dystopian Fiction",
      page_count: 328,
      publication_date: "1949-06-08",
      authors: "George Orwell",
      publishers: "Secker & Warburg",
      cover_type: "paperback" as const,
    },
    4: {
      type: "book",
      book_id: 4,
      genre: "Romance",
      page_count: 432,
      publication_date: "1813-01-28",
      authors: "Jane Austen",
      publishers: "T. Egerton",
      cover_type: "hardcover" as const,
    },
    5: {
      type: "book",
      book_id: 5,
      genre: "Coming-of-age",
      page_count: 277,
      publication_date: "1951-07-16",
      authors: "J.D. Salinger",
      publishers: "Little, Brown and Company",
      cover_type: "paperback" as const,
    },
    6: {
      type: "dvd",
      dvd_id: 6,
      release_date: "1994-09-23",
      dvd_type: "Blu-ray" as const,
      genre: "Drama",
      studio: "Columbia Pictures",
      director: "Frank Darabont",
    },
    7: {
      type: "dvd",
      dvd_id: 7,
      release_date: "1972-03-24",
      dvd_type: "Blu-ray" as const,
      genre: "Crime",
      studio: "Paramount Pictures",
      director: "Francis Ford Coppola",
    },
    8: {
      type: "dvd",
      dvd_id: 8,
      release_date: "1994-10-14",
      dvd_type: "Standard DVD" as const,
      genre: "Crime",
      studio: "Miramax Films",
      director: "Quentin Tarantino",
    },
    9: {
      type: "dvd",
      dvd_id: 9,
      release_date: "2008-07-18",
      dvd_type: "Blu-ray" as const,
      genre: "Action",
      studio: "Warner Bros.",
      director: "Christopher Nolan",
    },
    10: {
      type: "dvd",
      dvd_id: 10,
      release_date: "1994-07-06",
      dvd_type: "Standard DVD" as const,
      genre: "Drama",
      studio: "Paramount Pictures",
      director: "Robert Zemeckis",
    },
    11: {
      type: "cd",
      cd_id: 11,
      track_list:
        "Track 1: Come Together\nTrack 2: Something\nTrack 3: Maxwell's Silver Hammer\nTrack 4: Oh! Darling\nTrack 5: Octopus's Garden\nTrack 6: I Want You (She's So Heavy)\nTrack 7: Here Comes the Sun\nTrack 8: Because\nTrack 9: You Never Give Me Your Money\nTrack 10: Sun King\nTrack 11: Mean Mr. Mustard\nTrack 12: Polythene Pam\nTrack 13: She Came in Through the Bathroom Window\nTrack 14: Golden Slumbers\nTrack 15: Carry That Weight\nTrack 16: The End\nTrack 17: Her Majesty",
      genre: "Rock",
      record_label: "Apple Records",
      artists: "The Beatles",
      release_date: "1969-09-26",
    },
    12: {
      type: "cd",
      cd_id: 12,
      track_list:
        "Track 1: Wanna Be Startin' Somethin'\nTrack 2: Baby Be Mine\nTrack 3: The Girl Is Mine\nTrack 4: Thriller\nTrack 5: Beat It\nTrack 6: Billie Jean\nTrack 7: Human Nature\nTrack 8: P.Y.T. (Pretty Young Thing)\nTrack 9: The Lady in My Life",
      genre: "Pop",
      record_label: "Epic Records",
      artists: "Michael Jackson",
      release_date: "1982-11-30",
    },
    13: {
      type: "cd",
      cd_id: 13,
      track_list:
        "Track 1: Speak to Me\nTrack 2: Breathe (In the Air)\nTrack 3: On the Run\nTrack 4: Time\nTrack 5: The Great Gig in the Sky\nTrack 6: Money\nTrack 7: Us and Them\nTrack 8: Any Colour You Like\nTrack 9: Brain Damage\nTrack 10: Eclipse",
      genre: "Progressive Rock",
      record_label: "Harvest Records",
      artists: "Pink Floyd",
      release_date: "1973-03-01",
    },
    14: {
      type: "cd",
      cd_id: 14,
      track_list:
        "Track 1: Hells Bells\nTrack 2: Shoot to Thrill\nTrack 3: What Do You Do for Money Honey\nTrack 4: Given the Dog a Bone\nTrack 5: Let Me Put My Love into You\nTrack 6: Back in Black\nTrack 7: You Shook Me All Night Long\nTrack 8: Have a Drink on Me\nTrack 9: Shake a Leg\nTrack 10: Rock and Roll Ain't Noise Pollution",
      genre: "Hard Rock",
      record_label: "Atlantic Records",
      artists: "AC/DC",
      release_date: "1980-07-25",
    },
    15: {
      type: "cd",
      cd_id: 15,
      track_list:
        "Track 1: Hotel California\nTrack 2: New Kid in Town\nTrack 3: Life in the Fast Lane\nTrack 4: Wasted Time\nTrack 5: Wasted Time (Reprise)\nTrack 6: Victim of Love\nTrack 7: Pretty Maids All in a Row\nTrack 8: Try and Love Again\nTrack 9: The Last Resort",
      genre: "Rock",
      record_label: "Asylum Records",
      artists: "Eagles",
      release_date: "1976-12-08",
    },
  }

  

  // Get base product data
  return response as Product | Book | DVD | CD | null;
}


export async function getAllProducts() : Promise<Product[]>{
  let response = await api.get(`/product/all`);
  return response;
}

export async function editProduct(product: any){
  console.log("product", product)
  let response = await api.post("/updating/ProductInfo",product);
  return response;
}

export type Product = {
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

export type Book = Product & {
  book_id: number
  genre: string
  page_count: number
  publication_date: string
  authors: string
  publishers: string
  cover_type: "hardcover" | "paperback"
}

export type DVD = Product & {
  dvd_id: number
  release_date: string
  dvd_type: "Blu-ray" | "Standard DVD"
  genre: string
  studio: string
  director: string
}

export type CD = Product & {
  cd_id: number
  track_list: string
  genre: string
  record_label: string
  artists: string
  release_date: string
}

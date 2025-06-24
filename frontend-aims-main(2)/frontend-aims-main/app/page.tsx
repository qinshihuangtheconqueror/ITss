import ProductList from "@/components/product-list"
import { Suspense } from "react"
import ProductListSkeleton from "@/components/product-list-skeleton"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </main>
    </div>
  )
}

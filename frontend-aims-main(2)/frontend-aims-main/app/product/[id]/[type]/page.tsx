import { notFound } from "next/navigation"
import ProductDetail from "@/components/product-detail"
import { fetchProductById } from "@/lib/utils"
import { Suspense } from "react"
import ProductDetailSkeleton from "@/components/product-detail-skeleton"

interface ProductPageProps {
  params: {
    id: string
    type: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productId = Number.parseInt(params.id)
  const type = params.type
  if (isNaN(productId)) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent productId={productId} type={type} />
      </Suspense>
    </div>
  )
}

async function ProductDetailContent({ productId, type }: { productId: number, type: string }) {
  const product = await fetchProductById(productId, type)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}

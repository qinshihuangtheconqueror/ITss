"use client"

import type React from "react"

import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.quantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      await addToCart(product, 1)
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link href={`/product/${product.product_id}/${product.type}`} className="block">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-[5/8]">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
              <Badge variant="outline" className="mt-1 capitalize">
                {product.type}
              </Badge>
            </div>
          </div>
          <div className="text-lg font-bold mt-2">{formatCurrency(product.price)}</div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.introduction}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm">
              {product.quantity > 0 ? (
                <span className="text-green-600">In Stock: {product.quantity}</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={handleAddToCart}
              disabled={product.quantity === 0 || isAdding}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

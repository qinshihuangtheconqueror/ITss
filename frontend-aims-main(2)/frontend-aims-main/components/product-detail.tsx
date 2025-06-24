"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { Book, DVD, CD, Product } from "@/lib/types"
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Zap } from "lucide-react"
import Link from "next/link"
import BookDetails from "./book-details"
import DVDDetails from "./dvd-details"
import CDDetails from "./cd-details"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface ProductDetailProps {
  product: Product | Book | DVD | CD
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (product.quantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      })
      return
    }

    try {
      await addToCart(product, quantity)
      toast({
        title: "Added to cart",
        description: `Added ${quantity} item(s) of ${product.title} to your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    }
  }

  const renderProductSpecificDetails = () => {
    switch (product.type) {
      case "book":
        return <BookDetails book={product as Book} />
      case "dvd":
        return <DVDDetails dvd={product as DVD} />
      case "cd":
        return <CDDetails cd={product as CD} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden border">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {product.type}
              </Badge>
              {product.rush_order_supported && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Rush Order
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-muted-foreground text-lg">{product.introduction}</p>
          </div>

          {/* Price and Stock */}
          <div className="space-y-4">
            <div className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {product.quantity > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({product.quantity} available)</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">Weight: {product.weight}kg</div>
            </div>
          </div>

          {/* Quantity Selector and Add to Cart */}
          {product.quantity > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-medium">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.quantity}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleAddToCart} className="w-full flex items-center gap-2" size="lg">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart - {formatCurrency(product.price * quantity)}
              </Button>
            </div>
          )}

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Barcode:</span>
                  <div className="text-muted-foreground">{product.barcode}</div>
                </div>
                <div>
                  <span className="font-medium">Import Date:</span>
                  <div className="text-muted-foreground">{product.import_date}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product-Specific Details */}
      <div className="mt-8">
        <Separator className="mb-6" />
        {renderProductSpecificDetails()}
      </div>
    </div>
  )
}

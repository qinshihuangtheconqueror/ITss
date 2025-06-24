"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, fetchProductById } from "@/lib/utils"
import type { Product, Book, DVD, CD } from "@/lib/types"
import {
  Package,
  Calendar,
  Barcode,
  Weight,
  Zap,
  BookOpen,
  Disc,
  Music,
  Building,
  Users,
  Film,
  Building2,
} from "lucide-react"

interface ProductDetailViewProps {
  productId: number | null
  open: boolean
  onClose: () => void
  type : string
}

export default function ProductDetailView({ productId, open, onClose, type }: ProductDetailViewProps) {
  const [product, setProduct] = useState<Product | Book | DVD | CD | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && productId) {
      loadProductDetails()
    }
  }, [open, productId, type])

  const loadProductDetails = async () => {
    if (!productId) return

    setIsLoading(true)
    try {
      const productData = await fetchProductById(productId,type)
      setProduct(productData)
      console.log(productData)
    } catch (error) {
      console.error("Failed to load product details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderTypeSpecificDetails = () => {
    if (!product) return null

    switch (product.type) {
      case "book":
        const book = product as Book
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Book Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Authors</div>
                      <div className="text-muted-foreground">{book.authors}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Publishers</div>
                      <div className="text-muted-foreground">{book.publishers}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Publication Date</div>
                      <div className="text-muted-foreground">
                        {new Date(book.publication_date).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Genre</div>
                    <Badge variant="outline" className="mt-1">
                      {book.genre}
                    </Badge>
                  </div>

                  <div>
                    <div className="font-medium">Cover Type</div>
                    <div className="text-muted-foreground capitalize">{book.cover_type}</div>
                  </div>

                  <div>
                    <div className="font-medium">Page Count</div>
                    <div className="text-muted-foreground">{book.page_count} pages</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "dvd":
        const dvd = product as DVD
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Disc className="h-5 w-5" />
                DVD Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Film className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Director</div>
                      <div className="text-muted-foreground">{dvd.director}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Studio</div>
                      <div className="text-muted-foreground">{dvd.studio}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Release Date</div>
                      <div className="text-muted-foreground">{dvd.release_date}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Genre</div>
                    <Badge variant="outline" className="mt-1">
                      {dvd.genre}
                    </Badge>
                  </div>

                  <div>
                    <div className="font-medium">DVD Type</div>
                    <div className="text-muted-foreground capitalize">{dvd.dvd_type}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "cd":
        const cd = product as CD
        const trackList = cd.track_list.split("\n").filter((track) => track.trim())
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                CD Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Artists</div>
                      <div className="text-muted-foreground">{cd.artists}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Record Label</div>
                      <div className="text-muted-foreground">{cd.record_label}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Release Date</div>
                      <div className="text-muted-foreground">
                        {new Date(cd.release_date).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Genre</div>
                    <Badge variant="outline" className="mt-1">
                      {cd.genre}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Track List */}
              {trackList.length > 0 && (
                <div className="mt-6">
                  <div className="font-medium mb-3">Track List</div>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <ol className="space-y-1">
                      {trackList.map((track, index) => (
                        <li key={index} className="text-sm flex">
                          <span className="text-muted-foreground w-8">{index + 1}.</span>
                          <span>{track.trim()}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading product details...</p>
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden border max-w-sm mx-auto">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
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
                  <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
                  <p className="text-muted-foreground">{product.introduction}</p>
                </div>

                {/* Basic Product Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">Price:</div>
                        <div className="text-lg font-bold text-primary">{formatCurrency(product.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">Stock:</div>
                        <div className={product.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {product.quantity} units
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <div className="font-medium">Weight:</div>
                        <div className="text-muted-foreground">{product.weight}kg</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="font-medium">Import Date:</div>
                        <div className="text-muted-foreground">{product.import_date}</div>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <Barcode className="h-4 w-4 text-muted-foreground" />
                        <div className="font-medium">Barcode:</div>
                        <div className="text-muted-foreground font-mono">{product.barcode}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Type-specific Details */}
            {renderTypeSpecificDetails()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p>Product not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

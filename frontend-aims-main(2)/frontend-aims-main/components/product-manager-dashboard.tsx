"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, fetchProductById, editProduct } from "@/lib/utils"
import { Plus, Edit, Package, Eye } from "lucide-react"
import type { Product, Book, DVD, CD } from "@/lib/types"
import ProductForm from "@/components/product-form"
import ProductDetailView from "@/components/product-detail-view"
import { useToast } from "@/hooks/use-toast"
import { getAllProducts } from "@/lib/utils"

export default function ProductManagerDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | Book | DVD | CD | null>(null)
  const [viewingProductId, setViewingProductId] = useState<number | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [viewingProductType, setViewingProductType] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      // Use the same fetchProducts function as the main site
      const result = await getAllProducts()  // Get all 15 products
      setProducts(result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductForm(true)
  }

  const handleEditProduct = async (product: Product) => {
    setIsLoading(true)
    try {
      // Fetch the full product details including type-specific fields
      const fullProduct = await fetchProductById(product.product_id,product.type)
      if (fullProduct) {
        setEditingProduct(fullProduct)
        setShowProductForm(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to load product details for editing",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details for editing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProduct = (productId: number,type: string) => {
    setViewingProductId(productId)
    setViewingProductType(type)
    setShowProductDetail(true)
  }

  const handleProductSaved = async (savedProduct: Product | Book | DVD | CD) => {
    if (editingProduct) {
      // Update existing product
      await editProduct(savedProduct)
      setProducts((prev) => prev.map((p) => (p.product_id === savedProduct.product_id ? savedProduct : p)))
      toast({
        title: "Product updated",
        description: `${savedProduct.title} has been updated successfully`,
      })
    } else {
      // Add new product
      setProducts((prev) => [savedProduct, ...prev])
      toast({
        title: "Product added",
        description: `${savedProduct.title} has been added successfully`,
      })
    }
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleFormClose = () => {
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleDetailClose = () => {
    setShowProductDetail(false)
    setViewingProductId(null)
  }

  if (isLoading && products.length === 0) {
    return <div>Loading products...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={handleAddProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Rush Order</th>
                  <th className="text-left py-3 px-4">Import Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleViewProduct(product.product_id,product.type)}
                      >
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">{product.barcode}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {product.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-4">
                      <span className={product.quantity > 0 ? "text-green-600" : "text-red-600"}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.rush_order_supported ? "default" : "secondary"}>
                        {product.rush_order_supported ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{product.import_date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProduct(product.product_id,product.type)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="flex items-center gap-2"
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm product={editingProduct} onSave={handleProductSaved} onClose={handleFormClose} />
      )}

      {/* Product Detail View Modal */}
        <ProductDetailView productId={viewingProductId} open={showProductDetail} onClose={handleDetailClose} type={viewingProductType || ""} />
    </div>
  )
}

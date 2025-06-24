"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Product, Book, DVD, CD } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ProductFormProps {
  product?: Product | Book | DVD | CD | null
  onSave: (product: Product | Book | DVD | CD) => void
  onClose: () => void
}

interface BookFormData {
  genre: string
  page_count: number
  publication_date: string
  authors: string
  publishers: string
  cover_type: "hardcover" | "paperback"
}

interface DVDFormData {
  release_date: string
  dvd_type: "Blu-ray" | "Standard DVD"
  genre: string
  studio: string
  director: string
}

interface CDFormData {
  track_list: string
  genre: string
  record_label: string
  artists: string
  release_date: string
}

export default function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  // Initialize form data from product prop
  const [formData, setFormData] = useState({
    title: product?.title || "",
    type: product?.type || "book",
    price: product?.price || 0,
    weight: product?.weight || 0,
    rush_order_supported: product?.rush_order_supported || false,
    image_url: product?.image_url || "",
    barcode: product?.barcode || "",
    introduction: product?.introduction || "",
    quantity: product?.quantity || 0,
  })

  // Type-specific form data
  const [bookData, setBookData] = useState<BookFormData>({
    genre: (product as Book)?.genre || "",
    page_count: (product as Book)?.page_count || 0,
    publication_date: (product as Book)?.publication_date || "",
    authors: (product as Book)?.authors || "",
    publishers: (product as Book)?.publishers || "",
    cover_type: (product as Book)?.cover_type || "paperback",
  })

  const [dvdData, setDVDData] = useState<DVDFormData>({
    release_date: (product as DVD)?.release_date || "",
    dvd_type: (product as DVD)?.dvd_type || "Standard DVD",
    genre: (product as DVD)?.genre || "",
    studio: (product as DVD)?.studio || "",
    director: (product as DVD)?.director || "",
  })

  const [cdData, setCDData] = useState<CDFormData>({
    track_list: (product as CD)?.track_list || "",
    genre: (product as CD)?.genre || "",
    record_label: (product as CD)?.record_label || "",
    artists: (product as CD)?.artists || "",
    release_date: (product as CD)?.release_date || "",
  })

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        type: product.type || "book",
        price: product.price || 0,
        weight: product.weight || 0,
        rush_order_supported: product.rush_order_supported || false,
        image_url: product.image_url || "",
        barcode: product.barcode || "",
        introduction: product.introduction || "",
        quantity: product.quantity || 0,
      })

      if (product.type === "book") {
        const bookProduct = product as Book
        setBookData({
          genre: bookProduct.genre || "",
          page_count: bookProduct.page_count || 0,
          publication_date: bookProduct.publication_date || "",
          authors: bookProduct.authors || "",
          publishers: bookProduct.publishers || "",
          cover_type: bookProduct.cover_type || "paperback",
        })
      } else if (product.type === "dvd") {
        const dvdProduct = product as DVD
        setDVDData({
          release_date: dvdProduct.release_date || "",
          dvd_type: dvdProduct.dvd_type || "Standard DVD",
          genre: dvdProduct.genre || "",
          studio: dvdProduct.studio || "",
          director: dvdProduct.director || "",
        })
      } else if (product.type === "cd") {
        const cdProduct = product as CD
        setCDData({
          track_list: cdProduct.track_list || "",
          genre: cdProduct.genre || "",
          record_label: cdProduct.record_label || "",
          artists: cdProduct.artists || "",
          release_date: cdProduct.release_date || "",
        })
      }
    }
  }, [product])

  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(product?.image_url || null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // Process uploaded file
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      updateField("image_url", result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    updateField("image_url", "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.barcode || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate type-specific fields
    if (formData.type === "book" && (!bookData.authors || !bookData.publishers)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all book-specific fields",
        variant: "destructive",
      })
      return
    }

    if (formData.type === "dvd" && (!dvdData.director || !dvdData.studio)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all DVD-specific fields",
        variant: "destructive",
      })
      return
    }

    if (formData.type === "cd" && (!cdData.artists || !cdData.record_label)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all CD-specific fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const baseProduct = {
        product_id: product?.product_id || Date.now(),
        title: formData.title,
        type: formData.type as "book" | "dvd" | "cd",
        price: formData.price,
        weight: formData.weight,
        rush_order_supported: formData.rush_order_supported,
        image_url: formData.image_url || `/placeholder.svg?height=200&width=200&query=${formData.type}`,
        barcode: formData.barcode,
        import_date: product?.import_date || new Date().toISOString().split("T")[0],
        introduction: formData.introduction,
        quantity: formData.quantity,
      }

      let savedProduct: Product | Book | DVD | CD

      switch (formData.type) {
        case "book":
          savedProduct = {
            ...baseProduct,
            book_id: (product as Book)?.book_id || Date.now(),
            ...bookData,
          } as Book
          break
        case "dvd":
          savedProduct = {
            ...baseProduct,
            dvd_id: (product as DVD)?.dvd_id || Date.now(),
            ...dvdData,
          } as DVD
          break
        case "cd":
          savedProduct = {
            ...baseProduct,
            cd_id: (product as CD)?.cd_id || Date.now(),
            ...cdData,
          } as CD
          break
        default:
          savedProduct = baseProduct
      }

      // Log the saved product for debugging
      console.log("Saving product:", savedProduct)

      onSave(savedProduct)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateBookField = (field: keyof BookFormData, value: any) => {
    setBookData((prev) => ({ ...prev, [field]: value }))
  }

  const updateDVDField = (field: keyof DVDFormData, value: any) => {
    setDVDData((prev) => ({ ...prev, [field]: value }))
  }

  const updateCDField = (field: keyof CDFormData, value: any) => {
    setCDData((prev) => ({ ...prev, [field]: value }))
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "book":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authors">Authors *</Label>
                  <Input
                    id="authors"
                    value={bookData.authors}
                    onChange={(e) => updateBookField("authors", e.target.value)}
                    placeholder="Author 1, Author 2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="publishers">Publishers *</Label>
                  <Input
                    id="publishers"
                    value={bookData.publishers}
                    onChange={(e) => updateBookField("publishers", e.target.value)}
                    placeholder="Publisher Name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={bookData.genre}
                    onChange={(e) => updateBookField("genre", e.target.value)}
                    placeholder="Fiction, Non-Fiction, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="page_count">Page Count</Label>
                  <Input
                    id="page_count"
                    type="number"
                    min="0"
                    value={bookData.page_count}
                    onChange={(e) => updateBookField("page_count", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="cover_type">Cover Type</Label>
                  <Select value={bookData.cover_type} onValueChange={(value) => updateBookField("cover_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paperback">Paperback</SelectItem>
                      <SelectItem value="hardcover">Hardcover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="publication_date">Publication Date</Label>
                <Input
                  id="publication_date"
                  type="date"
                  value={bookData.publication_date}
                  onChange={(e) => updateBookField("publication_date", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )

      case "dvd":
        return (
          <Card>
            <CardHeader>
              <CardTitle>DVD Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="director">Director *</Label>
                  <Input
                    id="director"
                    value={dvdData.director}
                    onChange={(e) => updateDVDField("director", e.target.value)}
                    placeholder="Director Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studio">Studio *</Label>
                  <Input
                    id="studio"
                    value={dvdData.studio}
                    onChange={(e) => updateDVDField("studio", e.target.value)}
                    placeholder="Studio Name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dvd_genre">Genre</Label>
                  <Input
                    id="dvd_genre"
                    value={dvdData.genre}
                    onChange={(e) => updateDVDField("genre", e.target.value)}
                    placeholder="Action, Comedy, Drama, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="dvd_type">DVD Type</Label>
                  <Select value={dvdData.dvd_type} onValueChange={(value) => updateDVDField("dvd_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard DVD">Standard DVD</SelectItem>
                      <SelectItem value="Blu-ray">Blu-ray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dvd_release_date">Release Date</Label>
                  <Input
                    id="dvd_release_date"
                    type="date"
                    value={dvdData.release_date}
                    onChange={(e) => updateDVDField("release_date", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "cd":
        return (
          <Card>
            <CardHeader>
              <CardTitle>CD Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artists">Artists *</Label>
                  <Input
                    id="artists"
                    value={cdData.artists}
                    onChange={(e) => updateCDField("artists", e.target.value)}
                    placeholder="Artist 1, Artist 2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="record_label">Record Label *</Label>
                  <Input
                    id="record_label"
                    value={cdData.record_label}
                    onChange={(e) => updateCDField("record_label", e.target.value)}
                    placeholder="Record Label Name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cd_genre">Genre</Label>
                  <Input
                    id="cd_genre"
                    value={cdData.genre}
                    onChange={(e) => updateCDField("genre", e.target.value)}
                    placeholder="Pop, Rock, Jazz, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="cd_release_date">Release Date</Label>
                  <Input
                    id="cd_release_date"
                    type="date"
                    value={cdData.release_date}
                    onChange={(e) => updateCDField("release_date", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="track_list">Track List</Label>
                <Textarea
                  id="track_list"
                  value={cdData.track_list}
                  onChange={(e) => updateCDField("track_list", e.target.value)}
                  placeholder="Track 1: Song Title 1&#10;Track 2: Song Title 2&#10;Track 3: Song Title 3"
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">Enter each track on a new line</p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product information below." : "Fill in the details for the new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Product Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => updateField("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="dvd">DVD</SelectItem>
                      <SelectItem value="cd">CD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (VND) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => updateField("price", Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Stock Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => updateField("quantity", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="barcode">Barcode *</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => updateField("barcode", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="introduction">Product Description</Label>
                <Textarea
                  id="introduction"
                  value={formData.introduction}
                  onChange={(e) => updateField("introduction", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rush_order"
                  checked={formData.rush_order_supported}
                  onCheckedChange={(checked) => updateField("rush_order_supported", checked)}
                />
                <Label htmlFor="rush_order">Support Rush Order</Label>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedImage ? (
                  <div className="relative">
                    <div className="relative w-full max-w-xs mx-auto aspect-[3/4] border rounded-lg overflow-hidden">
                      <Image
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <div className="space-y-2">
                      <p className="font-medium">Drag and drop an image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse files</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Maximum file size: 5MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

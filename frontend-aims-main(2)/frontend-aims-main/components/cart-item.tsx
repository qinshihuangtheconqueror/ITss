"use client"

import { useState } from "react"
import Image from "next/image"
import { useCart, type CartItem as CartItemType } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, toggleSelect, state } = useCart()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.quantity) return

    setIsUpdating(true)
    try {
      await updateQuantity(item.product.product_id, newQuantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    try {
      await removeFromCart(item.product.product_id)
      toast({
        title: "Removed from cart",
        description: `${item.product.title} has been removed from your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const handleToggleSelect = () => {
    toggleSelect(item.product.product_id)
  }

  const subtotal = item.product.price * item.quantity

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg bg-card">
      {/* Checkbox */}
      <Checkbox checked={item.selected} onCheckedChange={handleToggleSelect} className="mt-2" />

      {/* Product Image */}
      <Link href={`/product/${item.product.product_id}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-md overflow-hidden">
          <Image
            src={item.product.image_url || "/placeholder.svg"}
            alt={item.product.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.product.product_id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
            {item.product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="capitalize">
            {item.product.type}
          </Badge>
          {item.product.rush_order_supported && (
            <Badge variant="secondary" className="text-xs">
              Rush Order
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.product.introduction}</p>

        {/* Stock Status */}
        <div className="mt-2">
          {item.product.quantity > 0 ? (
            <span className="text-sm text-green-600">In Stock ({item.product.quantity} available)</span>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Price and Controls */}
      <div className="flex flex-col items-end space-y-3">
        {/* Price */}
        <div className="text-right">
          <div className="text-lg font-bold">{formatCurrency(subtotal)}</div>
          <div className="text-sm text-muted-foreground">{formatCurrency(item.product.price)} each</div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating || state.isLoading}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-3 py-1 min-w-[2rem] text-center text-sm">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.product.quantity || isUpdating || state.isLoading}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={state.isLoading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

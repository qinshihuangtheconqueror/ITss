"use client"

import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createOrder, saveOrderToLocalStorage } from "@/lib/order-utils"

const VAT_RATE = 0.1 // 10% VAT

export default function OrderSummary() {
  const { state, getSelectedTotal, getSelectedCount } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const selectedItems = state.items.filter((item) => item.selected)
  const subtotal = getSelectedTotal()
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  const selectedCount = getSelectedCount()

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to checkout",
        variant: "destructive",
      })
      return
    }
    const order = await createOrder(state.items)
    saveOrderToLocalStorage(order)
    console.log(order)
    // Navigate to checkout page
    router.push("/checkout")
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Items Info */}
        <div className="text-sm text-muted-foreground">
          {selectedCount} of {state.items.length} items selected
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (10%):</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Selected Items:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedItems.map((item) => (
                <div key={item.product.product_id} className="text-xs text-muted-foreground flex justify-between">
                  <span className="truncate flex-1 mr-2">{item.product.title}</span>
                  <span>×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={selectedItems.length === 0 || state.isLoading}
          className="w-full"
          size="lg"
        >
          {selectedItems.length === 0 ? "Select Items to Checkout" : `Checkout`}
        </Button>
      </CardContent>
    </Card>
  )
}

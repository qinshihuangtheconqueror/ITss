"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import CartItem from "./cart-item"
import OrderSummary from "./order-summary"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CartView() {
  const { state, selectAll, clearCart, getSelectedCount } = useCart()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const { toast } = useToast()

  if (state.items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const allSelected = state.items.every((item) => item.selected)
  const selectedCount = getSelectedCount()

  const handleSelectAll = (checked: boolean) => {
    selectAll(checked)
  }

  const handleClearCart = async () => {
    setShowClearDialog(true)
  }

  const confirmClearCart = async () => {
    await clearCart()
    setShowClearDialog(false)
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select All Header */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center space-x-3">
              <Checkbox id="select-all" checked={allSelected} onCheckedChange={handleSelectAll} />
              <label htmlFor="select-all" className="font-medium cursor-pointer">
                Select All ({state.items.length} items)
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              className="flex items-center gap-2"
              disabled={state.isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {/* Cart Items List */}
          <div className="space-y-4">
            {state.items.map((item) => (
              <CartItem key={item.product.product_id} item={item} />
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear your cart? This action cannot be undone and all items will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearCart}>Clear Cart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

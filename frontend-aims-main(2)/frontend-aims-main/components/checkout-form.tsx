"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { processCheckout, calculateShippingFees, VnpayTrigger } from "@/lib/checkout-utils"
import { VIETNAM_PROVINCES, RUSH_DELIVERY_TIME_SLOTS } from "@/lib/checkout-types"
import type { CheckoutFormData } from "@/lib/checkout-types"
import { ShoppingCart, Truck, CreditCard, MapPin, User, Phone, Mail, Clock, Zap } from "lucide-react"

export default function CheckoutForm() {
  const { state, getSelectedTotal, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const selectedItems = state.items.filter((item) => item.selected)
  const subtotal = getSelectedTotal()
  const vat = subtotal * 0.1
  const total = subtotal + vat

  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    deliveryInfo: {
      name: "",
      phone: "",
      email: "",
      address: "",
      province: "",
      delivery_message: "",
    },
    orderLineList: selectedItems.map((item) => ({
      product_id: item.product.product_id,
      status: "pending" as const,
      quantity: item.quantity,
      total_Fee: item.product.price * item.quantity,
      delivery_time: null,
      instructions: null,
      rush_order: false,
    })),
    paymentMethod: "cod",
    status: "pending",
    total_after_VAT: total,
    total_before_VAT: subtotal,
    vat: vat,
  })

  // Thêm state
  const [shippingCalculation, setShippingCalculation] = useState({
    regularShipping: 0,
    rushShipping: 0,
    freeShippingDiscount: 0,
    totalShipping: 0,
  })

  // useEffect để tính shipping khi province thay đổi
  useEffect(() => {
    const calculateShipping = async () => {
      if (!formData.deliveryInfo.province) {
        setShippingCalculation({
          regularShipping: 0,
          rushShipping: 0,
          freeShippingDiscount: 0,
          totalShipping: 0,
        })
        return
      }

      try {
        const result = await calculateShippingFees(
          formData.deliveryInfo.province,
          state.items,
          formData.orderLineList
        )
        setShippingCalculation(result)
      } catch (error) {
        console.error('Error calculating shipping:', error)
      }
    }

    calculateShipping()
  }, [formData.deliveryInfo.province, state.items, formData.orderLineList])

  // Trong render, chỉ sử dụng state
  const finalTotal = total + shippingCalculation.totalShipping

  if (selectedItems.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No items selected for checkout</h2>
        <p className="text-muted-foreground mb-6">Please select items from your cart to proceed.</p>
        <Button onClick={() => router.push("/cart")}>Go to Cart</Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate rush delivery info
    const rushItems = formData.orderLineList.filter((line) => line.rush_order)
    for (const rushItem of rushItems) {
      if (!rushItem.delivery_time) {
        toast({
          title: "Missing rush delivery information",
          description: "Please provide delivery time for all rush delivery items",
          variant: "destructive",
        })
        return
      }
    }

    setIsProcessing(true)

    try {
      const result = await processCheckout(formData, shippingCalculation)
      let paymentUrl = await VnpayTrigger(finalTotal)
      window.location.href = paymentUrl
      if (result.success) {
        // Clear the cart after successful payment
        if (result.clearCart) {
          await clearCart()
        }

        toast({
          title: "Order placed successfully!",
          description: `Your order #${result.orderId} has been placed and is being processed.`,
        })
      } else {
        toast({
          title: "Checkout failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const updateDeliveryInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryInfo: { ...prev.deliveryInfo, [field]: value },
    }))
  }

  const updateOrderLine = (productId: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      orderLineList: prev.orderLineList.map((line) =>
        line.product_id === productId ? { ...line, [field]: value } : line,
      ),
    }))

    // If disabling rush order, clear delivery_time and instructions
    if (field === "rush_order" && !value) {
      setFormData((prev) => ({
        ...prev,
        orderLineList: prev.orderLineList.map((line) =>
          line.product_id === productId ? { ...line, delivery_time: null, instructions: null } : line,
        ),
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.deliveryInfo.name}
                  onChange={(e) => updateDeliveryInfo("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.deliveryInfo.phone}
                  onChange={(e) => updateDeliveryInfo("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.deliveryInfo.email}
                onChange={(e) => updateDeliveryInfo("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="province">Province/City *</Label>
              <Select
                value={formData.deliveryInfo.province}
                onValueChange={(value) => updateDeliveryInfo("province", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province/city" />
                </SelectTrigger>
                <SelectContent>
                  {VIETNAM_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                value={formData.deliveryInfo.address}
                onChange={(e) => updateDeliveryInfo("address", e.target.value)}
                placeholder="Street address, ward, district..."
                required
              />
            </div>

            <div>
              <Label htmlFor="delivery_message">Delivery Instructions (Optional)</Label>
              <Textarea
                id="delivery_message"
                value={formData.deliveryInfo.delivery_message}
                onChange={(e) => updateDeliveryInfo("delivery_message", e.target.value)}
                placeholder="Special delivery instructions..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Items ({selectedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItems.map((item) => {
              const orderLine = formData.orderLineList.find((line) => line.product_id === item.product.product_id)
              const isRushOrder = orderLine?.rush_order || false

              return (
                <div key={item.product.product_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.product.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} × {item.quantity} ={" "}
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">Weight: {item.product.weight}kg</p>
                    </div>
                    {item.product.rush_order_supported && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Rush Available
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Rush Order Option */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`rush-${item.product.product_id}`}
                        checked={isRushOrder}
                        onCheckedChange={(checked) => updateOrderLine(item.product.product_id, "rush_order", checked)}
                        disabled={!item.product.rush_order_supported}
                      />
                      <Label htmlFor={`rush-${item.product.product_id}`} className="text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Rush Delivery (2 hours) - Additional {formatCurrency(10000)}
                        </span>
                        {!item.product.rush_order_supported && (
                          <span className="text-muted-foreground"> (Not available)</span>
                        )}
                      </Label>
                    </div>

                    {/* Rush Delivery Details */}
                    {isRushOrder && (
                      <div className="ml-6 space-y-3 p-3 bg-orange-50 rounded-md border border-orange-200">
                        <div>
                          <Label htmlFor={`rush-time-${item.product.product_id}`} className="text-sm font-medium">
                            Preferred Delivery Time *
                          </Label>
                          <Select
                            value={orderLine?.delivery_time || ""}
                            onValueChange={(value) => updateOrderLine(item.product.product_id, "delivery_time", value)}
                            required
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select 2-hour time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {RUSH_DELIVERY_TIME_SLOTS.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label
                            htmlFor={`rush-instructions-${item.product.product_id}`}
                            className="text-sm font-medium"
                          >
                            Rush Delivery Instructions
                          </Label>
                          <Textarea
                            id={`rush-instructions-${item.product.product_id}`}
                            value={orderLine?.instructions || ""}
                            onChange={(e) => updateOrderLine(item.product.product_id, "instructions", e.target.value)}
                            placeholder="Special instructions for rush delivery..."
                            className="mt-1 text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}

                    {/* Regular Instructions */}
                    {!isRushOrder && (
                      <div>
                        <Label htmlFor={`instructions-${item.product.product_id}`} className="text-sm">
                          Special Instructions
                        </Label>
                        <Input
                          id={`instructions-${item.product.product_id}`}
                          value={orderLine?.instructions || ""}
                          onChange={(e) => updateOrderLine(item.product.product_id, "instructions", e.target.value)}
                          placeholder="Any special handling instructions..."
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery (COD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="momo" id="momo" />
                <Label htmlFor="momo">Momo E-Wallet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vnpay" id="vnpay" />
                <Label htmlFor="vnpay">VNPay</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (10%):</span>
                <span>{formatCurrency(vat)}</span>
              </div>

              {/* Shipping Breakdown */}
              <Separator />
              <div className="space-y-1">
                <div className="font-medium">Shipping Fees:</div>
                {shippingCalculation.regularShipping > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>• Regular shipping:</span>
                    <span>{formatCurrency(shippingCalculation.regularShipping)}</span>
                  </div>
                )}
                {shippingCalculation.rushShipping > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>• Rush shipping:</span>
                    <span>{formatCurrency(shippingCalculation.rushShipping)}</span>
                  </div>
                )}
                {shippingCalculation.freeShippingDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>• Free shipping discount:</span>
                    <span>-{formatCurrency(shippingCalculation.freeShippingDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total shipping:</span>
                  <span>{formatCurrency(shippingCalculation.totalShipping)}</span>
                </div>
              </div>

              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing || !formData.deliveryInfo.province}
            >
              {isProcessing ? "Processing..." : `Place Order`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

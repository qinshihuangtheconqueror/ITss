"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, User } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function Header() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/images/logo.png" alt="AIMS Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-2xl">AIMS</div>
            <div className="text-sm text-muted-foreground">An Internet Media Store</div>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/track-order">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Track Order</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 relative">
              <ShoppingCart className="h-4 w-4" />
              <span>View Cart</span>
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

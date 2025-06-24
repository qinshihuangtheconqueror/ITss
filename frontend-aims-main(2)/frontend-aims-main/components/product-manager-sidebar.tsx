"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, ShoppingBag } from "lucide-react"

const navItems = [
  {
    title: "Manage Products",
    href: "/product-manager/products",
    icon: Package,
  },
  {
    title: "Manage Orders",
    href: "/product-manager/orders",
    icon: ShoppingBag,
  },
]

export default function ProductManagerSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-slate-50 border-r h-full py-6 px-3 flex flex-col">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-slate-200 text-slate-900 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

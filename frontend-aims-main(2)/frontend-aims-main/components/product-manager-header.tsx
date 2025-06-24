"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, History } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import ActionHistory from "@/components/action-history"

export default function ProductManagerHeader() {
  const { logout, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [showHistory, setShowHistory] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  return (
    <header className="border-b bg-slate-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/product-manager" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/images/logo.png" alt="AIMS Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-2xl">AIMS</div>
            <div className="text-sm text-muted-foreground">Product Manager</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </div>

      {/* Action History Modal */}
      <ActionHistory open={showHistory} onClose={() => setShowHistory(false)} />
    </header>
  )
}

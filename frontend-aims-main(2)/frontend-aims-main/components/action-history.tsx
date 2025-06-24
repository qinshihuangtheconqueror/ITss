"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClipboardList, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"

interface ActionLog {
  action_id: number
  action_name: string
  recorded_at: string
  note: string
  product_name?: string
}

export default function ActionHistory({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [actions, setActions] = useState<ActionLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadActionHistory()
    }
  }, [open])

  const loadActionHistory = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to fetch action history
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock data based on the Logger table schema
      const mockActions: ActionLog[] = [
        {
          action_id: 1,
          action_name: "add_product",
          recorded_at: "2024-06-01T10:15:00Z",
          note: "Added new book: The Great Gatsby",
          product_name: "The Great Gatsby",
        },
        {
          action_id: 2,
          action_name: "update_product",
          recorded_at: "2024-06-02T14:30:00Z",
          note: "Updated price for To Kill a Mockingbird from 250000 to 280000",
          product_name: "To Kill a Mockingbird",
        },
        {
          action_id: 3,
          action_name: "add_product",
          recorded_at: "2024-06-03T09:45:00Z",
          note: "Added new DVD: The Shawshank Redemption",
          product_name: "The Shawshank Redemption",
        },
        {
          action_id: 4,
          action_name: "update_product",
          recorded_at: "2024-06-04T16:20:00Z",
          note: "Updated stock quantity for 1984 from 8 to 12",
          product_name: "1984",
        },
        {
          action_id: 5,
          action_name: "add_product",
          recorded_at: "2024-06-05T11:10:00Z",
          note: "Added new CD: Abbey Road",
          product_name: "Abbey Road",
        },
        {
          action_id: 6,
          action_name: "update_product",
          recorded_at: "2024-06-06T13:40:00Z",
          note: "Updated product description for Pride and Prejudice",
          product_name: "Pride and Prejudice",
        },
        {
          action_id: 7,
          action_name: "add_product",
          recorded_at: "2024-06-07T10:30:00Z",
          note: "Added new book: The Catcher in the Rye",
          product_name: "The Catcher in the Rye",
        },
      ]

      setActions(mockActions)
    } catch (error) {
      console.error("Failed to load action history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Change filteredActions to just use actions directly instead of filtering
  const filteredActions = actions

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch (e) {
      return dateString
    }
  }

  // Remove the unused getActionIcon function
  const getActionBadge = (actionName: string) => {
    switch (actionName) {
      case "add_product":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Add Product
          </Badge>
        )
      case "update_product":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Update Product
          </Badge>
        )
      default:
        return <Badge variant="outline">{actionName}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Product Management History
          </DialogTitle>
          <DialogDescription>View the history of product additions and updates</DialogDescription>
        </DialogHeader>

        {/* Remove the entire search and tabs section */}

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading action history...</p>
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No actions found</h3>
              <p className="text-muted-foreground">No product management actions have been recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActions.map((action) => (
                <Card key={action.action_id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionBadge(action.action_name)}
                          <span className="font-medium">{action.product_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{action.note}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(action.recorded_at)}</span>
                        </div>
                      </div>
                      {/* Remove the icon from each action item */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

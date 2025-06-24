import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/types"
import { BookOpen, Calendar, Users, Building } from "lucide-react"

interface BookDetailsProps {
  book: Book
}

export default function BookDetails({ book }: BookDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Book Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Authors</div>
                <div className="text-muted-foreground">{book.authors}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Publishers</div>
                <div className="text-muted-foreground">{book.publishers}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Publication Date</div>
                <div className="text-muted-foreground">
                  {new Date(book.publication_date).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-medium">Genre</div>
              <Badge variant="outline" className="mt-1">
                {book.genre}
              </Badge>
            </div>

            <div>
              <div className="font-medium">Cover Type</div>
              <div className="text-muted-foreground capitalize">{book.cover_type}</div>
            </div>

            <div>
              <div className="font-medium">Page Count</div>
              <div className="text-muted-foreground">{book.page_count} pages</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DVD } from "@/lib/types"
import { Disc, Calendar, Film, Building2 } from "lucide-react"

interface DVDDetailsProps {
  dvd: DVD
}

export default function DVDDetails({ dvd }: DVDDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Disc className="h-5 w-5" />
          DVD Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Film className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Director</div>
                <div className="text-muted-foreground">{dvd.director}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Studio</div>
                <div className="text-muted-foreground">{dvd.studio}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Release Date</div>
                <div className="text-muted-foreground">{dvd.release_date}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-medium">Genre</div>
              <Badge variant="outline" className="mt-1">
                {dvd.genre}
              </Badge>
            </div>

            <div>
              <div className="font-medium">DVD Type</div>
              <div className="text-muted-foreground capitalize">{dvd.dvd_type}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

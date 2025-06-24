import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CD } from "@/lib/types"
import { Music, Calendar, Users, Building } from "lucide-react"

interface CDDetailsProps {
  cd: CD
}

export default function CDDetails({ cd }: CDDetailsProps) {
  const trackList = cd.track_list.split(",").filter((track) => track.trim())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          CD Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Artists</div>
                <div className="text-muted-foreground">{cd.artists}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Record Label</div>
                <div className="text-muted-foreground">{cd.record_label}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium">Release Date</div>
                <div className="text-muted-foreground">{new Date(cd.release_date).toLocaleDateString("vi-VN")}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="font-medium">Genre</div>
              <Badge variant="outline" className="mt-1">
                {cd.genre}
              </Badge>
            </div>
          </div>
        </div>

        {/* Track List */}
        {trackList.length > 0 && (
          <div className="mt-6">
            <div className="font-medium mb-3">Track List</div>
            <div className="bg-muted/50 rounded-lg p-4">
              <ol className="space-y-1">
                {trackList.map((track, index) => (
                  <li key={index} className="text-sm flex">
                    <span className="text-muted-foreground w-8">{index + 1}.</span>
                    <span>{track.trim()}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

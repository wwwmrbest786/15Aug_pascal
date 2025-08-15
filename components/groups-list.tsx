import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Group {
  id: string
  name: string
  description: string | null
  settings: any
}

interface GroupsListProps {
  groups: Group[]
  userId: string
}

export function GroupsList({ groups, userId }: GroupsListProps) {
  if (groups.length === 0) {
    return (
      <div className="mobile-container px-4">
        <div className="text-center py-16">
          <div className="bg-muted/50 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
          <p className="text-muted-foreground mb-8 text-sm">Join a group or create your own to start wagering</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/join-group">Join Group</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/create-group">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-container px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Your Groups</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/create-group">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <Link key={group.id} href={`/group/${group.id}`}>
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{group.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Min: {group.settings?.tick_size_increment || 10}</span>
                      <span>Max: {group.settings?.max_bet_size || 1000}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className="text-sm font-medium text-foreground">0</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

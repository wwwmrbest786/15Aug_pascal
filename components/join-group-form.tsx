"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { joinGroup } from "@/lib/actions"
import { useActionState } from "react"

interface JoinGroupFormProps {
  userId: string
}

export function JoinGroupForm({ userId }: JoinGroupFormProps) {
  const [state, formAction] = useActionState(joinGroup, null)
  const [inviteCode, setInviteCode] = useState("")
  const [groupPreview, setGroupPreview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (state?.success && state?.groupId) {
    router.push(`/group/${state.groupId}`)
  }

  const handlePreviewGroup = async () => {
    if (!inviteCode.trim()) return

    setIsLoading(true)
    try {
      const { data: group, error } = await supabase
        .from("groups")
        .select("id, name, description, settings")
        .eq("invite_code", inviteCode.trim().toUpperCase())
        .single()

      if (error || !group) {
        setGroupPreview(null)
      } else {
        const { data: membership } = await supabase
          .from("group_memberships")
          .select("id")
          .eq("group_id", group.id)
          .eq("user_id", userId)
          .single()

        if (membership) {
          setGroupPreview(null)
        } else {
          setGroupPreview(group)
        }
      }
    } catch (error) {
      setGroupPreview(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Join Group</h1>
          <p className="text-muted-foreground">Enter an 8-digit alphanumeric invite code to join a betting group</p>
        </div>
      </div>

      {/* Join Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enter Invite Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="inviteCode">8-Digit Invite Code</Label>
            <div className="flex gap-2">
              <Input
                id="inviteCode"
                placeholder="ABC12345"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="flex-1 font-mono"
                maxLength={8}
              />
              <Button onClick={handlePreviewGroup} disabled={isLoading || !inviteCode.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Enter the 8-character code shared by the group admin</p>
          </div>

          {groupPreview && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{groupPreview.name}</h3>
                {groupPreview.description && (
                  <p className="text-sm text-muted-foreground mb-3">{groupPreview.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span>Min Bet: {groupPreview.settings?.tick_size_increment || 10}</span>
                  <span>Max Bet: {groupPreview.settings?.max_bet_size || 1000}</span>
                </div>
                <form action={formAction}>
                  <input type="hidden" name="inviteCode" value={inviteCode} />
                  <Button type="submit" className="w-full">
                    Join Group
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Don't have an invite code?</p>
          <Button asChild variant="outline">
            <Link href="/create-group">Create Your Own Group</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

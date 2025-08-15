"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createGroup } from "@/lib/actions"
import { useActionState } from "react"

interface CreateGroupFormProps {
  userId: string
}

export function CreateGroupForm({ userId }: CreateGroupFormProps) {
  const [state, formAction] = useActionState(createGroup, null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (state?.success && state?.groupId) {
    router.push(`/group/${state.groupId}`)
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
          <h1 className="text-2xl font-serif font-bold text-foreground">Create Group</h1>
          <p className="text-muted-foreground">Start your own betting community</p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Create Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Group Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input id="name" name="name" placeholder="Enter group name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" name="description" placeholder="Describe your betting group" />
            </div>
          </CardContent>
        </Card>

        {/* Create Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Group...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </>
          )}
        </Button>
      </form>

      {/* Help Text */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Already have an invite code?</p>
          <Button asChild variant="outline">
            <Link href="/join-group">Join Existing Group</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

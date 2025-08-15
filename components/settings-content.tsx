"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, LogOut, Edit2, Save, X } from "lucide-react"
import { signOut } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SettingsContentProps {
  user: any
  profile: any
}

export function SettingsContent({ user, profile }: SettingsContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [notifications, setNotifications] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("users").update({ display_name: displayName }).eq("id", user.id)

      if (!error) {
        setIsEditing(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-center py-6">
        <h1 className="text-2xl font-serif font-bold text-primary mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted/50" : ""}
              />
              {!isEditing ? (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" onClick={handleSaveProfile} disabled={isLoading}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setIsEditing(false)
                      setDisplayName(profile?.display_name || "")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified about bet outcomes and group activity</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Jurisdiction Status</p>
            <p className="text-sm text-muted-foreground">
              {profile?.jurisdiction_attested ? "✅ Verified" : "❌ Not verified"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Account Status</p>
            <p className="text-sm text-muted-foreground">
              {profile?.onboarding_completed ? "✅ Complete" : "⏳ Pending"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Sign Out Section */}
      <Card className="border-destructive/20">
        <CardContent className="pt-6">
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

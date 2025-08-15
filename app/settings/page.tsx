import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { SettingsContent } from "@/components/settings-content"

export default async function SettingsPage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="mobile-container">
          <SettingsContent user={user} profile={profile} />
        </div>
        <BottomNav currentPage="settings" />
      </div>
    )
  } catch (error) {
    console.error("Settings page error:", error)
    redirect("/auth/login")
  }
}

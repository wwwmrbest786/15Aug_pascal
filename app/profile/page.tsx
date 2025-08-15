import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { ProfileContent } from "@/components/profile-content"

export default async function ProfilePage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    // Get user profile and stats
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    // Get user's betting stats
    const { data: bets } = await supabase
      .from("bets")
      .select("*, groups(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Get user's group memberships
    const { data: memberships } = await supabase
      .from("group_members")
      .select("*, groups(name, id)")
      .eq("user_id", user.id)

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="mobile-container">
          <ProfileContent user={user} profile={profile} bets={bets || []} memberships={memberships || []} />
        </div>
        <BottomNav currentPage="home" />
      </div>
    )
  } catch (error) {
    console.error("Profile page error:", error)
    redirect("/auth/login")
  }
}

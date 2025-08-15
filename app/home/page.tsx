import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { HomeHeader } from "@/components/home-header"
import { GroupsList } from "@/components/groups-list"
import { OnboardingPrompt } from "@/components/onboarding-prompt"

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { data: memberships, error: membershipsError } = await supabase
    .from("group_memberships")
    .select("group_id, role, status")
    .eq("user_id", user.id)
    .eq("status", "active")

  console.log("User memberships:", { memberships, membershipsError })

  let groups = []
  if (memberships && !membershipsError && memberships.length > 0) {
    const groupIds = memberships.map((m) => m.group_id)
    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("id, name, description, settings, invite_code, created_at, created_by")
      .in("id", groupIds)

    console.log("Groups data:", { groupsData, groupsError })

    if (groupsData && !groupsError) {
      groups = groupsData
    }
  }

  console.log("Final groups for display:", groups)

  // Calculate net P/L across all groups
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .in("type", ["payout", "escrow_hold", "escrow_release", "refund"])

  let netPL = 0
  if (transactions) {
    netPL = transactions.reduce((total, tx) => {
      if (tx.type === "payout" || tx.type === "escrow_release" || tx.type === "refund") {
        return total + tx.amount
      } else if (tx.type === "escrow_hold") {
        return total - tx.amount
      }
      return total
    }, 0)
  }

  const needsOnboarding = groups.length === 0

  return (
    <div className="min-h-screen bg-background pb-20">
      <HomeHeader user={user} profile={profile} netPL={netPL} />

      <main className="py-6">
        {needsOnboarding ? <OnboardingPrompt /> : <GroupsList groups={groups} userId={user.id} />}
      </main>

      <BottomNav currentPage="home" />
    </div>
  )
}

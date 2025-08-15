import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { GroupDetailsContent } from "@/components/group-details-content"

interface GroupPageProps {
  params: {
    id: string
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: group, error: groupError } = await supabase.from("groups").select("*").eq("id", params.id).single()

  if (!group || groupError) {
    redirect("/home")
  }

  // Check if user is a member
  const { data: membership, error: membershipError } = await supabase
    .from("group_memberships")
    .select("*")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!membership || membershipError) {
    redirect("/home")
  }

  // Get group members
  const { data: members } = await supabase
    .from("group_memberships")
    .select("*, users(display_name, email)")
    .eq("group_id", params.id)

  // Get group bets
  const { data: bets } = await supabase
    .from("bets")
    .select("*, users(display_name)")
    .eq("group_id", params.id)
    .order("created_at", { ascending: false })

  // Get user's balance in this group
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", user.id)
    .eq("group_id", params.id)

  const balance =
    transactions?.reduce((sum, tx) => {
      return tx.type === "credit" ? sum + tx.amount : sum - tx.amount
    }, 0) || 0

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mobile-container">
        <GroupDetailsContent
          group={group}
          members={members || []}
          bets={bets || []}
          currentUser={user}
          membership={membership}
          balance={balance}
        />
      </div>
      <BottomNav currentPage="home" />
    </div>
  )
}

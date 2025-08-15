import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { HistoryList } from "@/components/history-list"

export default async function HistoryPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's betting history
  const { data: bets } = await supabase
    .from("bets")
    .select(`
      *,
      groups:group_id (name),
      bids (
        id,
        amount,
        user_id,
        users:user_id (username)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Betting History</h1>
          <p className="text-muted-foreground">Track your bets, wins, and transactions</p>
        </div>

        <HistoryList bets={bets || []} transactions={transactions || []} />
      </div>

      <BottomNav currentPage="history" />
    </div>
  )
}

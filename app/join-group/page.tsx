import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { JoinGroupForm } from "@/components/join-group-form"

export default async function JoinGroupPage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="mobile-container p-4">
          <JoinGroupForm userId={user.id} />
        </div>
        <BottomNav currentPage="home" />
      </div>
    )
  } catch (error) {
    console.error("Join group page error:", error)
    redirect("/auth/login")
  }
}

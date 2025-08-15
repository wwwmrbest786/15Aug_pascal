import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingContent } from "@/components/onboarding-content"

export default async function OnboardingPage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    // If already completed onboarding, redirect to home
    if (profile?.onboarding_completed && profile?.jurisdiction_attested) {
      redirect("/home")
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="mobile-container">
          <OnboardingContent user={user} profile={profile} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Onboarding page error:", error)
    redirect("/auth/login")
  }
}

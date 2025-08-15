import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default async function HomePage() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("onboarding_completed, jurisdiction_attested")
        .eq("id", user.id)
        .single()

      if (!userData?.jurisdiction_attested) {
        redirect("/onboarding")
      } else if (!userData?.onboarding_completed) {
        redirect("/onboarding")
      } else {
        redirect("/home")
      }
    }
  } catch (error) {
    console.log("Database connection issue, showing login form")
  }

  return (
    <div className="min-h-screen flex dark">
      {/* Left side - Enhanced gradient background with refined styling */}
      <div className="hidden lg:flex lg:flex-1 login-gradient items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h1 className="text-6xl font-bold mb-8 leading-tight">Wager with Friends</h1>
          <p className="text-xl text-white/95 leading-relaxed font-medium">
            Turn every prediction into an exciting challenge. Create groups, place bets, and see who comes out on top!
          </p>
        </div>
      </div>

      {/* Right side - Refined right side with better spacing and dark theme */}
      <div className="flex-1 lg:max-w-lg bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-serif font-bold text-primary mb-3">Pascal</h1>
            <h2 className="text-3xl font-semibold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground text-lg">Sign in to continue wagering</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}

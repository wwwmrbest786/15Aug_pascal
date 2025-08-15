import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  const supabase = createClient()

  if (searchParams.code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code)

      if (!error) {
        redirect("/home")
      }
    } catch (error) {
      console.error("Auth callback error:", error)
    }
  }

  redirect("/auth/login")
}

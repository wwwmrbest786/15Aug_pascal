"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, null)

  return (
    <Card className="border-border/10 shadow-2xl bg-card/80 backdrop-blur-md">
      <CardContent className="p-8 space-y-6">
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm font-medium">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="h-12 bg-input/50 border-border/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="h-12 bg-input/50 border-border/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to Pascal?{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
            >
              Create Account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

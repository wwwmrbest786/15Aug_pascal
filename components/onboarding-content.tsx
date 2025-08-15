"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Users, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface OnboardingContentProps {
  user: any
  profile: any
}

export function OnboardingContent({ user, profile }: OnboardingContentProps) {
  const [jurisdictionAccepted, setJurisdictionAccepted] = useState(profile?.jurisdiction_attested || false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCompleteOnboarding = async () => {
    if (!jurisdictionAccepted || !termsAccepted) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          jurisdiction_attested: true,
          onboarding_completed: true,
        })
        .eq("id", user.id)

      if (!error) {
        router.push("/home")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = jurisdictionAccepted && termsAccepted

  return (
    <div className="space-y-8 p-4 py-12">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-primary">Welcome to Pascal!</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Let's get you set up to start wagering with friends. Just a few quick steps to complete.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        <Card className={profile?.jurisdiction_attested ? "border-green-500/20 bg-green-500/5" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {profile?.jurisdiction_attested ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Jurisdiction Verification
              {profile?.jurisdiction_attested && <Badge variant="secondary">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By using Pascal, you confirm that you are legally allowed to participate in wagering activities in your
              jurisdiction.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="jurisdiction"
                checked={jurisdictionAccepted}
                onCheckedChange={(checked) => setJurisdictionAccepted(checked as boolean)}
              />
              <label
                htmlFor="jurisdiction"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm I am legally allowed to wager in my jurisdiction
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review and accept our terms of service to continue using Pascal.
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button onClick={handleCompleteOnboarding} disabled={!canProceed || isLoading} className="w-full">
          {isLoading ? "Completing Setup..." : "Complete Setup"}
        </Button>

        {canProceed && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Ready to get started?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline">
                <Link href="/join-group">
                  <Users className="h-4 w-4 mr-2" />
                  Join Group
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/create-group">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href="/home">
            Skip for now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

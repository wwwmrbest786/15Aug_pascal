import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, ArrowRight } from "lucide-react"

export function OnboardingPrompt() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">Welcome to Pascal!</h2>
        <p className="text-muted-foreground">
          Get started by joining an existing group or creating your own betting community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="bg-secondary/10 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Join a Group</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Have an invite code? Join your friends' betting group and start wagering together.
            </p>
            <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-white">
              <Link href="/join-group">
                Join Group
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="bg-accent/10 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
              <Plus className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Create a Group</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Start your own betting community and invite friends to join the fun.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent hover:text-white bg-transparent"
            >
              <Link href="/create-group">
                Create Group
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
          <Link href="/home">
            Skip for now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

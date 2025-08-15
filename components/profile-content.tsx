"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, TrendingUp, TrendingDown, Users, Target, Calendar, Settings } from "lucide-react"
import Link from "next/link"

interface ProfileContentProps {
  user: any
  profile: any
  bets: any[]
  memberships: any[]
}

export function ProfileContent({ user, profile, bets, memberships }: ProfileContentProps) {
  // Calculate stats
  const totalBets = bets.length
  const wonBets = bets.filter((bet) => bet.status === "won").length
  const lostBets = bets.filter((bet) => bet.status === "lost").length
  const pendingBets = bets.filter((bet) => bet.status === "pending").length
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0

  // Calculate P&L
  const totalWinnings = bets.filter((bet) => bet.status === "won").reduce((sum, bet) => sum + (bet.amount || 0), 0)
  const totalLosses = bets.filter((bet) => bet.status === "lost").reduce((sum, bet) => sum + (bet.amount || 0), 0)
  const netPL = totalWinnings - totalLosses

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6 p-4">
      {/* Profile Header */}
      <div className="text-center py-6">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {getInitials(profile?.display_name || user.email)}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
          {profile?.display_name || "Anonymous User"}
        </h1>
        <p className="text-muted-foreground">{user.email}</p>
        <div className="flex justify-center mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{totalBets}</div>
            <div className="text-sm text-muted-foreground">Total Bets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{winRate}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${netPL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {netPL >= 0 ? "+" : ""}
              {netPL}
            </div>
            <div className="text-sm text-muted-foreground">Net P&L</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{memberships.length}</div>
            <div className="text-sm text-muted-foreground">Groups</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Betting Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Won Bets</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-500">{wonBets}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Lost Bets</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-500">{lostBets}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Bets</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-yellow-500">{pendingBets}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {memberships.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No groups joined yet</p>
                <Button asChild className="mt-4">
                  <Link href="/join-group">Join a Group</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {memberships.map((membership) => (
                <Card key={membership.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{membership.groups?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(membership.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{membership.role}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {bets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No betting activity yet</p>
                <Button asChild className="mt-4">
                  <Link href="/home">Start Betting</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bets.slice(0, 10).map((bet) => (
                <Card key={bet.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{bet.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {bet.groups?.name} • {new Date(bet.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            bet.status === "won" ? "default" : bet.status === "lost" ? "destructive" : "secondary"
                          }
                        >
                          {bet.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{bet.amount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

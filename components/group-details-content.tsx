"use client"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useState, startTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Copy, Settings, TrendingUp, Clock, Target, ArrowLeft, Gavel, LogOut, DollarSign, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  createBet,
  createBid,
  acceptBid,
  submitOutcome,
  exitGroup,
  settleBets,
  closeBet,
  updateGroup,
  removeMember,
  deleteGroup, // Added deleteGroup import
} from "@/lib/actions"
import { useActionState } from "react"

interface GroupDetailsContentProps {
  group: any
  members: any[]
  bets: any[]
  currentUser: any
  membership: any
  balance: number
}

export function GroupDetailsContent({
  group,
  members,
  bets,
  currentUser,
  membership,
  balance,
}: GroupDetailsContentProps) {
  const [isCreateBetOpen, setIsCreateBetOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<any>(null)
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false)
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false)
  const [isSettleBetsOpen, setIsSettleBetsOpen] = useState(false)
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false)
  const router = useRouter()

  const [createBetState, createBetAction] = useActionState(createBet, { error: "", success: "" })
  const [bidState, bidAction] = useActionState(createBid, { error: "", success: "" })
  const [acceptBidState, acceptBidAction] = useActionState(acceptBid, { error: "", success: "" })
  const [outcomeState, outcomeAction] = useActionState(submitOutcome, { error: "", success: "" })
  const [exitGroupState, exitGroupAction] = useActionState(exitGroup, { error: "", success: "" })
  const [settleBetsState, settleBetsAction] = useActionState(settleBets, { error: "", success: "" })
  const [closeBetState, closeBetAction] = useActionState(closeBet, { error: "", success: "" })
  const [updateGroupState, updateGroupAction] = useActionState(updateGroup, { error: "", success: "" })
  const [removeMemberState, removeMemberAction] = useActionState(removeMember, { error: "", success: "" })
  const [deleteGroupState, deleteGroupAction] = useActionState(deleteGroup, { error: "", success: "" }) // Added deleteGroup state

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(group.invite_code)
    } catch (err) {
      console.error("Failed to copy invite code:", err)
    }
  }

  const getBetStatusColor = (state: string) => {
    switch (state) {
      case "open":
        return "secondary"
      case "active":
        return "default"
      case "originator_won":
        return "default"
      case "counterparty_won":
        return "default"
      case "disputed":
        return "destructive"
      case "cancelled":
        return "outline" // Added styling for cancelled bets
      default:
        return "secondary"
    }
  }

  const getBetStatusIcon = (state: string) => {
    switch (state) {
      case "open":
        return <Clock className="h-3 w-3 mr-1" />
      case "active":
        return <Target className="h-3 w-3 mr-1" />
      case "originator_won":
        return <TrendingUp className="h-3 w-3 mr-1" />
      case "counterparty_won":
        return <TrendingUp className="h-3 w-3 mr-1" />
      case "disputed":
        return <Gavel className="h-3 w-3 mr-1" />
      case "cancelled":
        return <X className="h-3 w-3 mr-1" /> // Added icon for cancelled bets
      default:
        return <Clock className="h-3 w-3 mr-1" />
    }
  }

  const canBidOnBet = (bet: any) => {
    return bet.state === "open" && bet.originator_id !== currentUser.id && new Date() < new Date(bet.bid_window_end)
  }

  const canSubmitOutcome = (bet: any) => {
    return (
      bet.state === "active" &&
      new Date() > new Date(bet.resolution_deadline) &&
      (bet.matches?.[0]?.originator_id === currentUser.id || bet.matches?.[0]?.counterparty_id === currentUser.id)
    )
  }

  const canCloseBet = (bet: any) => {
    return bet.state === "open" && bet.originator_id === currentUser.id && (!bet.bids || bet.bids.length === 0)
  }

  const handleExitGroup = () => {
    startTransition(() => {
      const formData = new FormData()
      formData.append("groupId", group.id)
      exitGroupAction(formData)
    })
  }

  const handleSettleBets = () => {
    startTransition(() => {
      const formData = new FormData()
      formData.append("groupId", group.id)
      settleBetsAction(formData)
    })
  }

  const handleCloseBet = (betId: string) => {
    startTransition(() => {
      const formData = new FormData()
      formData.append("betId", betId)
      closeBetAction(formData)
    })
  }

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      startTransition(() => {
        const formData = new FormData()
        formData.append("groupId", group.id)
        formData.append("memberId", memberId)
        removeMemberAction(formData)
      })
    }
  }

  const handleDeleteGroup = () => {
    startTransition(() => {
      const formData = new FormData()
      formData.append("groupId", group.id)
      deleteGroupAction(formData)
    })
  }

  // Calculate group stats
  const totalBets = bets.length
  const activeBets = bets.filter((bet) => bet.state === "active").length
  const openBets = bets.filter((bet) => bet.state === "open").length

  const visibleBets = bets // Show all bets including cancelled ones

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-foreground">{group.name}</h1>
          {group.description && <p className="text-muted-foreground">{group.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Invite Code:</span>
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{group.invite_code}</code>
            <Button variant="ghost" size="sm" onClick={copyInviteCode}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          {membership.role === "admin" && (
            <Dialog open={isGroupSettingsOpen} onOpenChange={setIsGroupSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Group Settings</DialogTitle>
                </DialogHeader>
                <form action={updateGroupAction} className="space-y-4">
                  <input type="hidden" name="groupId" value={group.id} />

                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      name="name"
                      defaultValue={group.name}
                      placeholder="Enter group name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description</Label>
                    <Textarea
                      id="groupDescription"
                      name="description"
                      defaultValue={group.description || ""}
                      placeholder="Enter group description"
                      rows={3}
                    />
                  </div>

                  {updateGroupState.error && <p className="text-sm text-red-500">{updateGroupState.error}</p>}

                  {updateGroupState.success && <p className="text-sm text-green-600">{updateGroupState.success}</p>}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsGroupSettingsOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Save Changes
                    </Button>
                  </div>
                </form>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        Delete Group
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete "{group.name}"? This action cannot be undone and
                          will remove all bets, members, and history associated with this group.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteGroup}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Group
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {deleteGroupState.error && <p className="text-sm text-red-500 mt-2">{deleteGroupState.error}</p>}

                  {deleteGroupState.success && (
                    <p className="text-sm text-green-600 mt-2">{deleteGroupState.success}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Exit group button with confirmation dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Exit Group</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave "{group.name}"? You will lose access to all group bets and history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleExitGroup}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Exit Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Error display for exit group */}
      {exitGroupState.error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
          {exitGroupState.error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{members.length}</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{openBets}</div>
            <div className="text-sm text-muted-foreground">Open Bets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{activeBets}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {balance >= 0 ? "+" : ""}
              {balance}
            </div>
            <div className="text-sm text-muted-foreground">Balance</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Dialog open={isCreateBetOpen} onOpenChange={setIsCreateBetOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Create Bet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Bet</DialogTitle>
            </DialogHeader>
            <form action={createBetAction} className="space-y-4">
              <input type="hidden" name="groupId" value={group.id} />

              <div className="space-y-2">
                <Label htmlFor="title">Bet Title</Label>
                <Input id="title" name="title" placeholder="Short title for your bet" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What are you betting on? Include details and conditions."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originatorStake">Your Stake</Label>
                  <Input id="originatorStake" name="originatorStake" type="number" placeholder="100" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minCounterStake">Min Counter Stake</Label>
                  <Input id="minCounterStake" name="minCounterStake" type="number" placeholder="50" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="other">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="biddingEnd">Bidding Ends</Label>
                  <Input id="biddingEnd" name="biddingEnd" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolutionDeadline">Resolution By</Label>
                  <Input id="resolutionDeadline" name="resolutionDeadline" type="datetime-local" required />
                </div>
              </div>

              {createBetState.error && <p className="text-sm text-red-500">{createBetState.error}</p>}

              <Button type="submit" className="w-full">
                Create Bet
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {balance !== 0 && (
          <AlertDialog open={isSettleBetsOpen} onOpenChange={setIsSettleBetsOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1 bg-transparent">
                <DollarSign className="h-4 w-4 mr-2" />
                Settle Bets
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Settle Your Bets</AlertDialogTitle>
                <AlertDialogDescription>
                  {balance > 0
                    ? `You are owed $${balance}. Mark this as settled when you have received payment.`
                    : `You owe $${Math.abs(balance)}. Mark this as settled when you have made payment.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSettleBets}>
                  {balance > 0 ? "Mark as Received" : "Mark as Paid"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button variant="outline" onClick={copyInviteCode}>
          <Copy className="h-4 w-4 mr-2" />
          Share Code
        </Button>
      </div>

      {settleBetsState.error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
          {settleBetsState.error}
        </div>
      )}

      {settleBetsState.success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl text-sm">
          {settleBetsState.success}
        </div>
      )}

      {closeBetState.error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
          {closeBetState.error}
        </div>
      )}

      {closeBetState.success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl text-sm">
          {closeBetState.success}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="bets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bets">Bets</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="bets" className="space-y-4">
          {visibleBets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No bets yet</p>
                <Button onClick={() => setIsCreateBetOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Bet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {visibleBets.map((bet) => (
                <Card key={bet.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{bet.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{bet.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            by {bet.users?.display_name || "Anonymous"} •{" "}
                            {new Date(bet.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getBetStatusColor(bet.state)}>
                          {getBetStatusIcon(bet.state)}
                          {bet.state === "cancelled" ? "Closed Bet" : bet.state}{" "}
                          {/* Display "Closed Bet" for cancelled bets */}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Stake: </span>
                          <span className="font-medium">{bet.originator_stake}</span>
                          <span className="text-muted-foreground"> • Min: </span>
                          <span className="font-medium">{bet.min_counter_stake}</span>
                        </div>
                        {bet.bid_window_end && (
                          <div className="text-xs text-muted-foreground">
                            Bids close: {new Date(bet.bid_window_end).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Action buttons based on bet state and user role */}
                      <div className="flex gap-2">
                        {canBidOnBet(bet) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBet(bet)
                              setIsBidDialogOpen(true)
                            }}
                          >
                            Place Bid
                          </Button>
                        )}

                        {canCloseBet(bet) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                Close Bet
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Close Bet</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to close "{bet.title}"? This action cannot be undone and no one
                                  will be able to bid on this bet.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCloseBet(bet.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Close Bet
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {bet.originator_id === currentUser.id && bet.bids?.length > 0 && bet.state === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBet(bet)
                              // Show bids dialog
                            }}
                          >
                            View Bids ({bet.bids.length})
                          </Button>
                        )}

                        {canSubmitOutcome(bet) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBet(bet)
                              setIsOutcomeDialogOpen(true)
                            }}
                          >
                            Submit Outcome
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="space-y-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.users?.display_name || member.users?.email || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{member.users?.display_name || "Anonymous User"}</p>
                      <p className="text-sm text-muted-foreground">{member.users?.email}</p>
                    </div>
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                    {membership.role === "admin" && member.user_id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          handleRemoveMember(
                            member.user_id,
                            member.users?.display_name || member.users?.email || "User",
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {removeMemberState.error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
              {removeMemberState.error}
            </div>
          )}

          {removeMemberState.success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl text-sm">
              {removeMemberState.success}
            </div>
          )}

          <Card className="border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">Invite Code: {group.invite_code}</p>
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bid Dialog */}
      <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Bid</DialogTitle>
          </DialogHeader>
          {selectedBet && (
            <form action={bidAction} className="space-y-4">
              <input type="hidden" name="betId" value={selectedBet.id} />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Betting on: <span className="font-medium">{selectedBet.title}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Minimum bid: <span className="font-medium">{selectedBet.min_counter_stake}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bidAmount">Your Bid Amount</Label>
                <Input
                  id="bidAmount"
                  name="amount"
                  type="number"
                  min={selectedBet.min_counter_stake}
                  placeholder={selectedBet.min_counter_stake.toString()}
                  required
                />
              </div>

              {bidState.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  {bidState.error}
                </div>
              )}

              {bidState.success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl text-sm">
                  {bidState.success}
                </div>
              )}

              <Button type="submit" className="w-full">
                Place Bid
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Outcome Dialog */}
      <Dialog open={isOutcomeDialogOpen} onOpenChange={setIsOutcomeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Outcome</DialogTitle>
          </DialogHeader>
          {selectedBet && (
            <form action={outcomeAction} className="space-y-4">
              <input type="hidden" name="betId" value={selectedBet.id} />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{selectedBet.title}</span>
                </p>
                <p className="text-sm text-muted-foreground">{selectedBet.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Who won this bet?</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="outcome" value="true" required />
                    <span>Bet originator won</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="outcome" value="false" required />
                    <span>Bet challenger won</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence/Notes (optional)</Label>
                <Textarea
                  id="evidence"
                  name="evidence"
                  placeholder="Provide any evidence or explanation for the outcome"
                />
              </div>

              {outcomeState.error && <p className="text-sm text-red-500">{outcomeState.error}</p>}

              <Button type="submit" className="w-full">
                Submit Outcome
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

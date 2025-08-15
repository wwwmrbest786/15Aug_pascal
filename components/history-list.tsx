import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { Users, UserPlus, UserMinus, Trophy, TrendingDown, AlertTriangle, Plus } from "lucide-react"

interface Bet {
  id: string
  title: string
  description: string
  amount: number
  status: "active" | "won" | "lost" | "refunded"
  created_at: string
  groups: { name: string }
  bids: Array<{
    id: string
    amount: number
    user_id: string
    users: { username: string }
  }>
}

interface Transaction {
  id: string
  type:
    | "deposit"
    | "withdrawal"
    | "bet_win"
    | "bet_loss"
    | "bet_refund"
    | "win"
    | "loss"
    | "settlement"
    | "group_join"
    | "group_exit"
    | "group_create"
    | "bet_create"
    | "bet_dispute"
  amount: number
  description: string
  created_at: string
}

interface HistoryListProps {
  bets: Bet[]
  transactions: Transaction[]
}

export function HistoryList({ bets, transactions }: HistoryListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "lost":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "refunded":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "bet_win":
      case "win":
      case "deposit":
        return "text-green-500"
      case "bet_loss":
      case "loss":
      case "withdrawal":
        return "text-red-500"
      case "bet_refund":
      case "settlement":
        return "text-yellow-500"
      case "group_join":
      case "group_create":
      case "bet_create":
        return "text-blue-500"
      case "group_exit":
        return "text-orange-500"
      case "bet_dispute":
        return "text-purple-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "group_join":
        return <UserPlus className="h-4 w-4" />
      case "group_exit":
        return <UserMinus className="h-4 w-4" />
      case "group_create":
        return <Users className="h-4 w-4" />
      case "bet_create":
        return <Plus className="h-4 w-4" />
      case "bet_win":
      case "win":
        return <Trophy className="h-4 w-4" />
      case "bet_loss":
      case "loss":
        return <TrendingDown className="h-4 w-4" />
      case "bet_dispute":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  const activities = transactions.filter((t) => t.amount === 0)
  const financialTransactions = transactions.filter((t) => t.amount !== 0)

  return (
    <Tabs defaultValue="bets" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="bets">My Bets</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>

      <TabsContent value="bets" className="space-y-4">
        {bets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No bets yet. Start betting to see your history!</p>
            </CardContent>
          </Card>
        ) : (
          bets.map((bet) => (
            <Card key={bet.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{bet.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{bet.groups.name}</p>
                  </div>
                  <Badge className={getStatusColor(bet.status)}>
                    {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">{bet.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">${bet.amount}</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(bet.created_at), { addSuffix: true })}
                  </span>
                </div>
                {bet.bids.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      {bet.bids.length} bid{bet.bids.length !== 1 ? "s" : ""}
                    </p>
                    <div className="space-y-1">
                      {bet.bids.slice(0, 3).map((bid) => (
                        <div key={bid.id} className="flex justify-between text-xs">
                          <span>{bid.users.username}</span>
                          <span className="font-medium">${bid.amount}</span>
                        </div>
                      ))}
                      {bet.bids.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{bet.bids.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="activities" className="space-y-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No activities yet.</p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-muted ${getTransactionColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className={getTransactionColor(activity.type)}>
                    {activity.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="transactions" className="space-y-4">
        {financialTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No transactions yet.</p>
            </CardContent>
          </Card>
        ) : (
          financialTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? "+" : ""}${transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{transaction.type.replace("_", " ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}

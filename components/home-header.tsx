import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HomeHeaderProps {
  user: any
  profile: any
  netPL: number
}

export function HomeHeader({ user, profile, netPL }: HomeHeaderProps) {
  const getPLColor = (amount: number) => {
    if (amount > 0) return "text-green-500"
    if (amount < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  const getPLIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="h-4 w-4" />
    if (amount < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  return (
    <header className="bg-card border-b border-border/50 sticky top-0 z-10">
      <div className="mobile-container px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-primary">Pascal</h1>
            <p className="text-sm text-muted-foreground">{profile?.display_name || user.email?.split("@")[0]}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Net P/L</p>
            <div className={`flex items-center gap-1 text-sm font-semibold ${getPLColor(netPL)}`}>
              {getPLIcon(netPL)}
              <span>
                {netPL >= 0 ? "+" : ""}
                {netPL}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

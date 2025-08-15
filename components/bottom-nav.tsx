import Link from "next/link"
import { Home, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  currentPage: "home" | "history" | "settings"
}

export function BottomNav({ currentPage }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 bottom-nav-safe-area">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/home"
          className={cn(
            "flex flex-col items-center py-3 px-6 rounded-xl transition-all duration-200",
            currentPage === "home"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground active:scale-95",
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          href="/history"
          className={cn(
            "flex flex-col items-center py-3 px-6 rounded-xl transition-all duration-200",
            currentPage === "history"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground active:scale-95",
          )}
        >
          <History className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">History</span>
        </Link>

        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center py-3 px-6 rounded-xl transition-all duration-200",
            currentPage === "settings"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground active:scale-95",
          )}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  )
}

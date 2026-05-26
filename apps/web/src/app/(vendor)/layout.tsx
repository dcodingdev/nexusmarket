import { Sidebar } from "@/modules/vendor/components/Sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@repo/types";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role={UserRole.VENDOR}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8">
            <div className="text-sm font-medium text-muted-foreground">
              NexusMarket / Vendor / Dashboard
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
                <span>View Storefront</span>
              </Link>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

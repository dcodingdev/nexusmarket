import { AccountSidebar } from "@/modules/customer/components/AccountSidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@repo/types";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role={UserRole.CUSTOMER}>
      <div className="flex min-h-screen bg-background">
        <AccountSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8">
            <div className="text-sm font-medium text-muted-foreground">
              NexusMarket / My Account
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

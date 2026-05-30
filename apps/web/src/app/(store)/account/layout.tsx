"use client";

import { AccountSidebar } from "@/modules/account/components/AccountSidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@repo/types";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuth();
  const pathname = usePathname();
  console.log("AccountLayout render. User:", user?._id, "Token length:", accessToken?.length || 0);


  return (
    <RoleGuard role={UserRole.CUSTOMER}>
      <div className="flex min-h-screen bg-background">
        <AccountSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-end px-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
                <span>View Storefront</span>
              </Link>
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

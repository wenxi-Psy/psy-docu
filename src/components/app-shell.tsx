"use client";

import { AuthGuard } from "./auth-guard";
import { Sidebar } from "./sidebar";
import { AppDataProvider } from "@/contexts/app-data-context";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AppDataProvider>
      <AuthGuard>
        <div className="flex h-screen bg-surface">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-0 pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0">{children}</main>
        </div>
      </AuthGuard>
    </AppDataProvider>
  );
}

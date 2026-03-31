"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-on-surface-variant text-sm">加载中...</div>
      </div>
    );
  }

  if (!user && pathname !== "/login") return null;

  return <>{children}</>;
}

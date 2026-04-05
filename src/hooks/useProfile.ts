"use client";

import { useAppData } from "@/contexts/app-data-context";

// Re-export type for backward compatibility
export type { Profile } from "@/types";

export function useProfile() {
  const { profile, loading, updateProfile } = useAppData();
  return { profile, loading, updateProfile };
}

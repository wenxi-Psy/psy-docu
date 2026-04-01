"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  defaultDuration: number;
  useSoap: boolean;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) { setLoading(false); return; }

    setProfile({
      id: data.id as string,
      email: (data.email as string) ?? "",
      displayName: (data.display_name as string) ?? "",
      defaultDuration: (data.default_duration as number) ?? 50,
      useSoap: (data.use_soap as boolean) ?? false,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (updates: {
    displayName?: string;
    defaultDuration?: number;
    useSoap?: boolean;
  }): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.defaultDuration !== undefined) dbUpdates.default_duration = updates.defaultDuration;
    if (updates.useSoap !== undefined) dbUpdates.use_soap = updates.useSoap;

    const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
    if (error) return false;
    await fetchProfile();
    return true;
  };

  return { profile, loading, updateProfile };
}

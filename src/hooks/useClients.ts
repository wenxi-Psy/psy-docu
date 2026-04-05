"use client";

import { useAppData } from "@/contexts/app-data-context";

export function useClients() {
  const {
    clients, allTags, loading, error,
    addClient, updateClient, addSession, updateSession, deleteTag,
    refetch,
  } = useAppData();

  return { clients, loading, error, allTags, addClient, updateClient, addSession, updateSession, deleteTag, refetch };
}

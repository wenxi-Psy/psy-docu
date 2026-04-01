"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Client, Session } from "@/types";

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function toClient(row: Record<string, unknown>, sessions: Session[], supervisionCount: number): Client {
  const startDate = row.start_date as string;
  const lastSession = sessions[0];
  const lastSessionDate = lastSession?.date ?? startDate;
  const days = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);

  // Only count completed sessions for the total
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return {
    id: row.id as string,
    alias: row.alias as string,
    status: row.status as Client["status"],
    color: (row.color as string | null) ?? null,
    startDate,
    lastSessionDate,
    totalSessions: completedSessions.length,
    totalSupervisions: supervisionCount,
    days,
    notes: (row.notes as string) ?? "",
    sessions, // Timeline shows all sessions (pending/completed/cancelled)
  };
}

function toSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    date: row.date as string,
    startTime: row.start_time as string,
    number: row.number as number,
    duration: row.duration as number,
    focus: (row.focus as string) ?? "",
    note: (row.note as string) ?? "",
    reflection: (row.reflection as string) ?? "",
    tags: (row.tags as string[]) ?? [],
    status: (row.status as Session["status"]) ?? "completed",
    subjective: (row.subjective as string) ?? undefined,
    objective: (row.objective as string) ?? undefined,
    assessment: (row.assessment as string) ?? undefined,
    plan: (row.plan as string) ?? undefined,
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchClients = useCallback(async () => {
    const [clientRes, sessionRes, ecRes, evtRes] = await Promise.all([
      supabase.from("clients").select("*").order("created_at"),
      supabase.from("sessions").select("*").order("date", { ascending: false }),
      supabase.from("event_clients").select("client_id, event_id"),
      supabase.from("events").select("id, status").eq("type", "supervision"),
    ]);

    if (clientRes.error || sessionRes.error || ecRes.error || evtRes.error) {
      console.error("fetchClients error:", clientRes.error, sessionRes.error, ecRes.error, evtRes.error);
      setLoading(false);
      return;
    }

    const clientRows = clientRes.data ?? [];
    const sessionRows = sessionRes.data ?? [];
    const ecRows = ecRes.data ?? [];
    const evtRows = evtRes.data ?? [];

    // Collect all tags
    const tagSet = new Set<string>();
    sessionRows.forEach((s) => {
      ((s.tags as string[]) ?? []).forEach((t) => tagSet.add(t));
    });
    setAllTags(Array.from(tagSet));

    // Build a set of completed supervision event IDs
    const completedSupervisionIds = new Set(
      evtRows.filter((e) => e.status === "completed").map((e) => e.id as string)
    );

    // Count supervisions per client (only completed ones)
    const supCounts = new Map<string, number>();
    for (const ec of ecRows) {
      const eid = ec.event_id as string;
      const cid = ec.client_id as string;
      if (completedSupervisionIds.has(eid)) {
        supCounts.set(cid, (supCounts.get(cid) || 0) + 1);
      }
    }

    // Group sessions by client
    const sessionsByClient = new Map<string, Session[]>();
    for (const s of sessionRows) {
      const cid = s.client_id as string;
      if (!sessionsByClient.has(cid)) sessionsByClient.set(cid, []);
      sessionsByClient.get(cid)!.push(toSession(s));
    }

    const result = clientRows.map((row) => {
      const cid = row.id as string;
      const sessions = sessionsByClient.get(cid) ?? [];
      const supCount = supCounts.get(cid) ?? 0;
      return toClient(row, sessions, supCount);
    });

    // Sort by last session date, most recent first
    result.sort((a, b) => b.lastSessionDate.localeCompare(a.lastSessionDate));
    setClients(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (client: { alias: string; notes: string; color?: string }): Promise<boolean> => {
    const userId = await getUserId();
    const row: Record<string, unknown> = {
      alias: client.alias,
      notes: client.notes,
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
      user_id: userId,
    };
    if (client.color) row.color = client.color;
    const { error } = await supabase.from("clients").insert(row);
    if (error) return false;
    await fetchClients();
    return true;
  };

  const updateClient = async (id: string, updates: { alias?: string; notes?: string; status?: string; color?: string | null }): Promise<boolean> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.alias !== undefined) dbUpdates.alias = updates.alias;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase.from("clients").update(dbUpdates).eq("id", id);
    if (error) return false;
    await fetchClients();
    return true;
  };

  const addSession = async (
    clientId: string,
    session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string },
    currentTotal: number
  ): Promise<boolean> => {
    const userId = await getUserId();
    const { error } = await supabase.from("sessions").insert({
      client_id: clientId,
      date: session.date,
      start_time: session.startTime,
      duration: session.duration,
      number: currentTotal + 1,
      focus: session.focus,
      note: session.note,
      reflection: session.reflection,
      tags: session.tags,
      subjective: session.subjective ?? null,
      objective: session.objective ?? null,
      assessment: session.assessment ?? null,
      plan: session.plan ?? null,
      status: "completed",
      user_id: userId,
    });
    if (error) return false;
    await fetchClients();
    return true;
  };

  const updateSession = async (sessionId: string, updates: {
    date?: string; startTime?: string; duration?: number; focus?: string; note?: string; reflection?: string; tags?: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string;
  }): Promise<boolean> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.focus !== undefined) dbUpdates.focus = updates.focus;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.reflection !== undefined) dbUpdates.reflection = updates.reflection;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.subjective !== undefined) dbUpdates.subjective = updates.subjective;
    if (updates.objective !== undefined) dbUpdates.objective = updates.objective;
    if (updates.assessment !== undefined) dbUpdates.assessment = updates.assessment;
    if (updates.plan !== undefined) dbUpdates.plan = updates.plan;

    const { error } = await supabase.from("sessions").update(dbUpdates).eq("id", sessionId);
    if (error) return false;
    await fetchClients();
    return true;
  };

  const deleteTag = async (tag: string): Promise<boolean> => {
    const { data: rows } = await supabase.from("sessions").select("id, tags").contains("tags", [tag]);
    if (!rows) return false;
    for (const row of rows) {
      const newTags = ((row.tags as string[]) ?? []).filter((t) => t !== tag);
      await supabase.from("sessions").update({ tags: newTags }).eq("id", row.id);
    }
    await fetchClients();
    return true;
  };

  return { clients, loading, allTags, addClient, updateClient, addSession, updateSession, deleteTag, refetch: fetchClients };
}

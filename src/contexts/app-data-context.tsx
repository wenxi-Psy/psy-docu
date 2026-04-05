"use client";

import {
  createContext, useContext, useState, useCallback,
  useEffect, useMemo, ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  Client, Session, ScheduleItem, EventType, Profile, ScheduleStatus,
} from "@/types";

// ─── Transform helpers ───────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
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

function buildClients(
  clientRows: Record<string, unknown>[],
  sessionRows: Record<string, unknown>[],
  ecRows: Record<string, unknown>[],
  evtRows: Record<string, unknown>[]
): Client[] {
  const completedSupervisionIds = new Set(
    evtRows
      .filter((e) => e.status === "completed" && e.type === "supervision")
      .map((e) => e.id as string)
  );
  const supCounts = new Map<string, number>();
  for (const ec of ecRows) {
    if (completedSupervisionIds.has(ec.event_id as string)) {
      const cid = ec.client_id as string;
      supCounts.set(cid, (supCounts.get(cid) || 0) + 1);
    }
  }

  const sessionsByClient = new Map<string, Session[]>();
  for (const s of sessionRows) {
    const cid = s.client_id as string;
    if (!sessionsByClient.has(cid)) sessionsByClient.set(cid, []);
    sessionsByClient.get(cid)!.push(toSession(s));
  }

  const result = clientRows.map((row) => {
    const cid = row.id as string;
    const sessions = sessionsByClient.get(cid) ?? [];
    const startDate = row.start_date as string;
    const lastSessionDate = sessions[0]?.date ?? startDate;
    const days = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);
    return {
      id: cid,
      alias: row.alias as string,
      status: row.status as Client["status"],
      color: (row.color as string | null) ?? null,
      startDate,
      lastSessionDate,
      totalSessions: sessions.filter((s) => s.status === "completed").length,
      totalSupervisions: supCounts.get(cid) ?? 0,
      days,
      notes: (row.notes as string) ?? "",
      sessions,
    };
  });

  result.sort((a, b) => b.lastSessionDate.localeCompare(a.lastSessionDate));
  return result;
}

function buildScheduleItems(
  sessionRows: Record<string, unknown>[],
  evtRows: Record<string, unknown>[],
  clientRows: Record<string, unknown>[],
  ecRows: Record<string, unknown>[]
): ScheduleItem[] {
  const clientMap = new Map<string, Record<string, unknown>>();
  for (const c of clientRows) clientMap.set(c.id as string, c);

  const sessionCounts = new Map<string, number>();
  for (const s of sessionRows) {
    if (s.status === "completed") {
      const cid = s.client_id as string;
      sessionCounts.set(cid, (sessionCounts.get(cid) || 0) + 1);
    }
  }

  const eventClientsMap = new Map<string, { id: string; alias: string }[]>();
  for (const ec of ecRows) {
    const eid = ec.event_id as string;
    const cid = ec.client_id as string;
    const client = clientMap.get(cid);
    if (!eventClientsMap.has(eid)) eventClientsMap.set(eid, []);
    eventClientsMap.get(eid)!.push({ id: cid, alias: (client?.alias as string) ?? "未知" });
  }

  const sessionItems: ScheduleItem[] = sessionRows.map((s) => {
    const client = clientMap.get(s.client_id as string);
    return {
      id: s.id as string,
      type: "consultation" as EventType,
      title: (client?.alias as string) ?? "咨询",
      date: s.date as string,
      startTime: (s.start_time as string) ?? "09:00",
      duration: (s.duration as number) ?? 50,
      note: (s.note as string) ?? "",
      status: (s.status as ScheduleStatus) ?? "pending",
      cancelReason: (s.cancel_reason as string) ?? "",
      clientId: s.client_id as string,
      clientAlias: (client?.alias as string) ?? "未知",
      focus: (s.focus as string) ?? "",
      reflection: (s.reflection as string) ?? "",
      tags: (s.tags as string[]) ?? [],
      subjective: (s.subjective as string) ?? undefined,
      objective: (s.objective as string) ?? undefined,
      assessment: (s.assessment as string) ?? undefined,
      plan: (s.plan as string) ?? undefined,
      number: (s.number as number) ?? 1,
      totalSessions: sessionCounts.get(s.client_id as string) ?? 0,
      clientStartDate: (client?.start_date as string) ?? "",
      clientColor: (client?.color as string | null) ?? null,
    };
  });

  const eventItems: ScheduleItem[] = evtRows.map((e) => ({
    id: e.id as string,
    type: e.type as EventType,
    title: (e.title as string) ?? "",
    date: e.date as string,
    startTime: (e.start_time as string) ?? "09:00",
    duration: (e.duration as number) ?? 60,
    note: (e.note as string) ?? "",
    status: (e.status as ScheduleStatus) ?? "pending",
    cancelReason: (e.cancel_reason as string) ?? "",
    relatedClients: eventClientsMap.get(e.id as string) ?? [],
  }));

  return [...sessionItems, ...eventItems];
}

function buildAllTags(sessionRows: Record<string, unknown>[]): string[] {
  const tagSet = new Set<string>();
  sessionRows.forEach((s) => ((s.tags as string[]) ?? []).forEach((t) => tagSet.add(t)));
  return Array.from(tagSet);
}

function toProfile(data: Record<string, unknown>): Profile {
  return {
    id: data.id as string,
    email: (data.email as string) ?? "",
    displayName: (data.display_name as string) ?? "",
    defaultDuration: (data.default_duration as number) ?? 50,
    useSoap: (data.use_soap as boolean) ?? false,
  };
}

// ─── Context types ───────────────────────────────────────────────────────────

interface AppDataContextValue {
  clients: Client[];
  allTags: string[];
  scheduleItems: ScheduleItem[];
  profile: Profile | null;
  loading: boolean;
  error: string | null;

  addClient: (client: { alias: string; notes: string; color?: string }) => Promise<boolean>;
  updateClient: (id: string, updates: { alias?: string; notes?: string; status?: string; color?: string | null }) => Promise<boolean>;
  addSession: (
    clientId: string,
    session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[]; status?: "completed" | "pending"; subjective?: string; objective?: string; assessment?: string; plan?: string },
    currentTotal: number
  ) => Promise<boolean>;
  updateSession: (sessionId: string, updates: { date?: string; startTime?: string; duration?: number; focus?: string; note?: string; reflection?: string; tags?: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string }) => Promise<boolean>;
  deleteTag: (tag: string) => Promise<boolean>;

  addEvent: (event: { type: EventType; title: string; date: string; startTime: string; duration: number; note: string; clientIds?: string[] }) => Promise<boolean>;
  updateSessionSchedule: (sessionId: string, updates: { date?: string; startTime?: string; duration?: number }) => Promise<boolean>;
  updateEventSchedule: (eventId: string, updates: { date?: string; startTime?: string; duration?: number; title?: string; clientIds?: string[] }) => Promise<boolean>;
  completeConsultation: (sessionId: string, updates: { focus: string; note: string; reflection: string; tags: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string }) => Promise<boolean>;
  completeEvent: (eventId: string, note?: string) => Promise<boolean>;
  cancelItem: (item: ScheduleItem, cancelReason: string) => Promise<boolean>;
  revertToPending: (item: ScheduleItem) => Promise<boolean>;

  updateProfile: (updates: { displayName?: string; defaultDuration?: number; useSoap?: boolean }) => Promise<boolean>;

  refetch: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [clientRows, setClientRows] = useState<Record<string, unknown>[]>([]);
  const [sessionRows, setSessionRows] = useState<Record<string, unknown>[]>([]);
  const [evtRows, setEvtRows] = useState<Record<string, unknown>[]>([]);
  const [ecRows, setEcRows] = useState<Record<string, unknown>[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state — recomputed only when raw rows change
  const clients = useMemo(
    () => buildClients(clientRows, sessionRows, ecRows, evtRows),
    [clientRows, sessionRows, ecRows, evtRows]
  );
  const scheduleItems = useMemo(
    () => buildScheduleItems(sessionRows, evtRows, clientRows, ecRows),
    [sessionRows, evtRows, clientRows, ecRows]
  );
  const allTags = useMemo(() => buildAllTags(sessionRows), [sessionRows]);

  // ─── Single fetch for all data ──────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }
    const userId = session.user.id;

    const [clientRes, sessionRes, evtRes, ecRes, profileRes] = await Promise.all([
      supabase.from("clients").select("*").order("created_at"),
      supabase.from("sessions").select("*").order("date", { ascending: false }),
      supabase.from("events").select("*").order("date"),
      supabase.from("event_clients").select("*"),
      supabase.from("profiles").select("*").eq("id", userId).single(),
    ]);

    if (clientRes.error || sessionRes.error || evtRes.error || ecRes.error) {
      setError("数据加载失败，请检查网络后重试");
    } else {
      setError(null);
      setClientRows(clientRes.data ?? []);
      setSessionRows(sessionRes.data ?? []);
      setEvtRows(evtRes.data ?? []);
      setEcRows(ecRes.data ?? []);
    }

    if (!profileRes.error && profileRes.data) {
      setProfile(toProfile(profileRes.data as Record<string, unknown>));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setClientRows([]);
        setSessionRows([]);
        setEvtRows([]);
        setEcRows([]);
        setProfile(null);
        setLoading(false);
        setError(null);
      } else if (event === "SIGNED_IN") {
        fetchAll();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAll]);

  // ─── Mutations ───────────────────────────────────────────────────────────

  const addClient = async (client: { alias: string; notes: string; color?: string }): Promise<boolean> => {
    const userId = await getUserId();
    const row: Record<string, unknown> = {
      alias: client.alias, notes: client.notes,
      status: "active", start_date: new Date().toISOString().split("T")[0], user_id: userId,
    };
    if (client.color) row.color = client.color;
    const { error } = await supabase.from("clients").insert(row);
    if (error) return false;
    await fetchAll();
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
    await fetchAll();
    return true;
  };

  const addSession = async (
    clientId: string,
    session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[]; status?: "completed" | "pending"; subjective?: string; objective?: string; assessment?: string; plan?: string },
    currentTotal: number
  ): Promise<boolean> => {
    const userId = await getUserId();
    const { error } = await supabase.from("sessions").insert({
      client_id: clientId, date: session.date, start_time: session.startTime,
      duration: session.duration, number: currentTotal + 1,
      focus: session.focus, note: session.note, reflection: session.reflection, tags: session.tags,
      subjective: session.subjective ?? null, objective: session.objective ?? null,
      assessment: session.assessment ?? null, plan: session.plan ?? null,
      status: session.status ?? "completed", user_id: userId,
    });
    if (error) return false;
    await fetchAll();
    return true;
  };

  const updateSession = async (sessionId: string, updates: { date?: string; startTime?: string; duration?: number; focus?: string; note?: string; reflection?: string; tags?: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string }): Promise<boolean> => {
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
    await fetchAll();
    return true;
  };

  const deleteTag = async (tag: string): Promise<boolean> => {
    const { data: rows } = await supabase.from("sessions").select("id, tags").contains("tags", [tag]);
    if (!rows) return false;
    for (const row of rows) {
      const newTags = ((row.tags as string[]) ?? []).filter((t) => t !== tag);
      await supabase.from("sessions").update({ tags: newTags }).eq("id", row.id);
    }
    await fetchAll();
    return true;
  };

  const addEvent = async (event: { type: EventType; title: string; date: string; startTime: string; duration: number; note: string; clientIds?: string[] }): Promise<boolean> => {
    const userId = await getUserId();
    if (!userId) return false;
    const { data, error } = await supabase.from("events").insert({
      type: event.type, title: event.title, date: event.date,
      start_time: event.startTime, duration: event.duration, note: event.note,
      user_id: userId, status: "pending",
    }).select("id").single();
    if (error || !data) return false;
    if (event.clientIds && event.clientIds.length > 0) {
      await supabase.from("event_clients").insert(
        event.clientIds.map((cid) => ({ event_id: data.id, client_id: cid }))
      );
    }
    await fetchAll();
    return true;
  };

  const updateSessionSchedule = async (sessionId: string, updates: { date?: string; startTime?: string; duration?: number }): Promise<boolean> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    const { error } = await supabase.from("sessions").update(dbUpdates).eq("id", sessionId);
    if (error) return false;
    await fetchAll();
    return true;
  };

  const updateEventSchedule = async (eventId: string, updates: { date?: string; startTime?: string; duration?: number; title?: string; clientIds?: string[] }): Promise<boolean> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    const { error } = await supabase.from("events").update(dbUpdates).eq("id", eventId);
    if (error) return false;
    if (updates.clientIds !== undefined) {
      await supabase.from("event_clients").delete().eq("event_id", eventId);
      if (updates.clientIds.length > 0) {
        await supabase.from("event_clients").insert(
          updates.clientIds.map((cid) => ({ event_id: eventId, client_id: cid }))
        );
      }
    }
    await fetchAll();
    return true;
  };

  const completeConsultation = async (sessionId: string, updates: { focus: string; note: string; reflection: string; tags: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string }): Promise<boolean> => {
    const { error } = await supabase.from("sessions").update({
      status: "completed",
      focus: updates.focus, note: updates.note, reflection: updates.reflection, tags: updates.tags,
      subjective: updates.subjective ?? null, objective: updates.objective ?? null,
      assessment: updates.assessment ?? null, plan: updates.plan ?? null,
    }).eq("id", sessionId);
    if (error) return false;
    await fetchAll();
    return true;
  };

  const completeEvent = async (eventId: string, note?: string): Promise<boolean> => {
    const upd: Record<string, unknown> = { status: "completed" };
    if (note !== undefined) upd.note = note;
    const { error } = await supabase.from("events").update(upd).eq("id", eventId);
    if (error) return false;
    await fetchAll();
    return true;
  };

  const cancelItem = async (item: ScheduleItem, cancelReason: string): Promise<boolean> => {
    const table = item.type === "consultation" ? "sessions" : "events";
    const { error } = await supabase.from(table).update({ status: "cancelled", cancel_reason: cancelReason }).eq("id", item.id);
    if (error) return false;
    await fetchAll();
    return true;
  };

  const revertToPending = async (item: ScheduleItem): Promise<boolean> => {
    const table = item.type === "consultation" ? "sessions" : "events";
    const { error } = await supabase.from(table).update({ status: "pending", cancel_reason: null }).eq("id", item.id);
    if (error) return false;
    await fetchAll();
    return true;
  };

  const updateProfile = async (updates: { displayName?: string; defaultDuration?: number; useSoap?: boolean }): Promise<boolean> => {
    const userId = await getUserId();
    if (!userId) return false;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.defaultDuration !== undefined) dbUpdates.default_duration = updates.defaultDuration;
    if (updates.useSoap !== undefined) dbUpdates.use_soap = updates.useSoap;
    const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", userId);
    if (error) return false;
    // Profile update doesn't touch client/session data — patch in-place
    setProfile((prev) => prev ? { ...prev, ...updates } : prev);
    return true;
  };

  const value: AppDataContextValue = {
    clients, allTags, scheduleItems, profile, loading, error,
    addClient, updateClient, addSession, updateSession, deleteTag,
    addEvent, updateSessionSchedule, updateEventSchedule,
    completeConsultation, completeEvent, cancelItem, revertToPending,
    updateProfile,
    refetch: fetchAll,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

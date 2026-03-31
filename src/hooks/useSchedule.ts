"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { ScheduleStatus } from "@/types";

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export type EventType = "consultation" | "supervision" | "other";

export interface ScheduleItem {
  id: string;
  type: EventType;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  note: string;
  status: ScheduleStatus;
  cancelReason?: string;
  clientId?: string;
  clientAlias?: string;
  focus?: string;
  reflection?: string;
  tags?: string[];
  number?: number;
  totalSessions?: number;
  clientStartDate?: string;
  relatedClients?: { id: string; alias: string }[];
}

export function useSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    const [sessRes, evtRes, clientRes, ecRes] = await Promise.all([
      supabase.from("sessions").select("*").order("date"),
      supabase.from("events").select("*").order("date"),
      supabase.from("clients").select("*"),
      supabase.from("event_clients").select("*"),
    ]);

    if (sessRes.error || evtRes.error || clientRes.error || ecRes.error) {
      console.error("fetchSchedule error:", sessRes.error, evtRes.error, clientRes.error, ecRes.error);
      setLoading(false);
      return;
    }

    const sessionRows = sessRes.data ?? [];
    const eventRows = evtRes.data ?? [];
    const clientRows = clientRes.data ?? [];
    const ecRows = ecRes.data ?? [];

    const clientMap = new Map<string, Record<string, unknown>>();
    for (const c of clientRows) clientMap.set(c.id as string, c);

    // Only count completed sessions for the total display
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
        id: s.id as string, type: "consultation" as EventType,
        title: (client?.alias as string) ?? "咨询",
        date: s.date as string, startTime: (s.start_time as string) ?? "09:00",
        duration: (s.duration as number) ?? 50, note: (s.note as string) ?? "",
        status: (s.status as ScheduleStatus) ?? "pending",
        cancelReason: (s.cancel_reason as string) ?? "",
        clientId: s.client_id as string, clientAlias: (client?.alias as string) ?? "未知",
        focus: (s.focus as string) ?? "", reflection: (s.reflection as string) ?? "",
        tags: (s.tags as string[]) ?? [],
        number: (s.number as number) ?? 1, totalSessions: sessionCounts.get(s.client_id as string) ?? 0,
        clientStartDate: (client?.start_date as string) ?? "",
      };
    });

    const eventItems: ScheduleItem[] = eventRows.map((e) => ({
      id: e.id as string, type: e.type as EventType,
      title: (e.title as string) ?? "", date: e.date as string,
      startTime: (e.start_time as string) ?? "09:00", duration: (e.duration as number) ?? 60,
      note: (e.note as string) ?? "",
      status: (e.status as ScheduleStatus) ?? "pending",
      cancelReason: (e.cancel_reason as string) ?? "",
      relatedClients: eventClientsMap.get(e.id as string) ?? [],
    }));

    setItems([...sessionItems, ...eventItems]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const getItemsForDate = useCallback(
    (date: string) => items.filter((i) => i.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [items]
  );

  const datesWithItems = useMemo(() => new Set(items.map((i) => i.date)), [items]);

  const addEvent = async (event: {
    type: EventType; title: string; date: string; startTime: string; duration: number; note: string; clientIds?: string[];
  }): Promise<boolean> => {
    const userId = await getUserId();
    if (!userId) return false;
    const { data, error } = await supabase.from("events").insert({
      type: event.type, title: event.title, date: event.date,
      start_time: event.startTime, duration: event.duration, note: event.note, user_id: userId,
      status: "pending",
    }).select("id").single();

    if (error || !data) return false;

    if (event.clientIds && event.clientIds.length > 0) {
      const links = event.clientIds.map((cid) => ({ event_id: data.id, client_id: cid }));
      await supabase.from("event_clients").insert(links);
    }

    await fetchSchedule();
    return true;
  };

  const completeConsultation = async (
    sessionId: string,
    updates: { focus: string; note: string; reflection: string; tags: string[] }
  ): Promise<boolean> => {
    const { error } = await supabase.from("sessions").update({
      status: "completed",
      focus: updates.focus,
      note: updates.note,
      reflection: updates.reflection,
      tags: updates.tags,
    }).eq("id", sessionId);
    if (error) return false;
    await fetchSchedule();
    return true;
  };

  const completeEvent = async (eventId: string, note?: string): Promise<boolean> => {
    const updates: Record<string, unknown> = { status: "completed" };
    if (note !== undefined) updates.note = note;
    const { error } = await supabase.from("events").update(updates).eq("id", eventId);
    if (error) return false;
    await fetchSchedule();
    return true;
  };

  const cancelItem = async (item: ScheduleItem, cancelReason: string): Promise<boolean> => {
    const table = item.type === "consultation" ? "sessions" : "events";
    const { error } = await supabase.from(table).update({
      status: "cancelled",
      cancel_reason: cancelReason,
    }).eq("id", item.id);
    if (error) return false;
    await fetchSchedule();
    return true;
  };

  const revertToPending = async (item: ScheduleItem): Promise<boolean> => {
    const table = item.type === "consultation" ? "sessions" : "events";
    const { error } = await supabase.from(table).update({
      status: "pending",
      cancel_reason: null,
    }).eq("id", item.id);
    if (error) return false;
    await fetchSchedule();
    return true;
  };

  return { items, loading, getItemsForDate, datesWithItems, addEvent, completeConsultation, completeEvent, cancelItem, revertToPending, refetch: fetchSchedule };
}

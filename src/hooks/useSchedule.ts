"use client";

import { useCallback, useMemo } from "react";
import { useAppData } from "@/contexts/app-data-context";
import { ScheduleItem } from "@/types";

// Re-export types for backward compatibility with existing imports
export type { EventType, ScheduleItem } from "@/types";

export function useSchedule() {
  const {
    clients, allTags, scheduleItems, loading, error,
    addSession, addEvent,
    updateSessionSchedule, updateEventSchedule,
    completeConsultation, completeEvent,
    cancelItem, revertToPending,
    refetch,
  } = useAppData();

  const getItemsForDate = useCallback(
    (date: string) =>
      scheduleItems
        .filter((i) => i.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [scheduleItems]
  );

  const datesWithItems = useMemo(
    () => new Set(scheduleItems.map((i) => i.date)),
    [scheduleItems]
  );

  const checkConflict = useCallback(
    (date: string, startTime: string, duration: number, excludeId?: string): ScheduleItem[] => {
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const newStart = toMin(startTime);
      const newEnd = newStart + duration;
      return scheduleItems.filter((i) => {
        if (i.id === excludeId) return false;
        if (i.date !== date) return false;
        if (i.status === "cancelled") return false;
        const iStart = toMin(i.startTime);
        const iEnd = iStart + i.duration;
        return newStart < iEnd && newEnd > iStart;
      });
    },
    [scheduleItems]
  );

  return {
    items: scheduleItems,
    loading,
    error,
    clients,      // exposed so schedule page doesn't need useClients
    allTags,      // exposed for CompleteConsultationModal
    addSession,   // exposed for AddEventModal consultation creation
    getItemsForDate,
    datesWithItems,
    checkConflict,
    addEvent,
    updateSessionSchedule,
    updateEventSchedule,
    completeConsultation,
    completeEvent,
    cancelItem,
    revertToPending,
    refetch,
  };
}

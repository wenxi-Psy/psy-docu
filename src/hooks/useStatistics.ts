"use client";

import { useMemo } from "react";
import { useAppData } from "@/contexts/app-data-context";

export interface MonthlyData {
  month: string; label: string; count: number; totalMinutes: number;
  supervisionCount: number; supervisionMinutes: number;
}

export interface MonthOverview {
  key: string; label: string; sessions: number; minutes: number;
  supervisions: number; supervisionMinutes: number;
}

export interface Statistics {
  totalSessions: number; totalMinutes: number;
  activeClients: number; pausedClients: number; endedClients: number;
  monthlyTrend: MonthlyData[]; availableMonths: MonthOverview[];
}

export function useStatistics() {
  const { clients, scheduleItems, loading, error, refetch } = useAppData();

  const stats = useMemo<Statistics>(() => {
    const now = new Date();

    const sessions = scheduleItems.filter(
      (i) => i.type === "consultation" && i.status === "completed"
    );
    const supervisions = scheduleItems.filter(
      (i) => i.type === "supervision" && i.status === "completed"
    );

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const activeClients = clients.filter((c) => c.status === "active").length;
    const pausedClients = clients.filter((c) => c.status === "paused").length;
    const endedClients = clients.filter((c) => c.status === "ended").length;

    const monthlyTrend: MonthlyData[] = [];
    const availableMonths: MonthOverview[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const shortLabel = `${d.getMonth() + 1}月`;
      const fullLabel = `${d.getFullYear()}年${d.getMonth() + 1}月`;

      const monthSess = sessions.filter((s) => s.date.startsWith(key));
      const monthSup = supervisions.filter((s) => s.date.startsWith(key));

      monthlyTrend.push({
        month: key, label: shortLabel,
        count: monthSess.length,
        totalMinutes: monthSess.reduce((sum, s) => sum + s.duration, 0),
        supervisionCount: monthSup.length,
        supervisionMinutes: monthSup.reduce((sum, s) => sum + s.duration, 0),
      });

      availableMonths.push({
        key, label: fullLabel,
        sessions: monthSess.length,
        minutes: monthSess.reduce((sum, s) => sum + s.duration, 0),
        supervisions: monthSup.length,
        supervisionMinutes: monthSup.reduce((sum, s) => sum + s.duration, 0),
      });
    }

    return { totalSessions, totalMinutes, activeClients, pausedClients, endedClients, monthlyTrend, availableMonths };
  }, [clients, scheduleItems]);

  return { stats, loading, error, refetch };
}

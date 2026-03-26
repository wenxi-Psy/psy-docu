"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const now = new Date();
      const [sessRes, evtRes, clientRes] = await Promise.all([
        supabase.from("sessions").select("date, duration"),
        supabase.from("events").select("type, date, duration").eq("type", "supervision"),
        supabase.from("clients").select("status"),
      ]);

      const sessions = sessRes.data ?? [];
      const supervisions = evtRes.data ?? [];
      const clients = clientRes.data ?? [];

      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, s) => sum + ((s.duration as number) || 0), 0);
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

        const monthSess = sessions.filter((s) => (s.date as string).startsWith(key));
        const monthSup = supervisions.filter((s) => (s.date as string).startsWith(key));

        monthlyTrend.push({
          month: key, label: shortLabel,
          count: monthSess.length, totalMinutes: monthSess.reduce((sum, s) => sum + ((s.duration as number) || 0), 0),
          supervisionCount: monthSup.length, supervisionMinutes: monthSup.reduce((sum, s) => sum + ((s.duration as number) || 0), 0),
        });

        availableMonths.push({
          key, label: fullLabel,
          sessions: monthSess.length, minutes: monthSess.reduce((sum, s) => sum + ((s.duration as number) || 0), 0),
          supervisions: monthSup.length, supervisionMinutes: monthSup.reduce((sum, s) => sum + ((s.duration as number) || 0), 0),
        });
      }

      setStats({ totalSessions, totalMinutes, activeClients, pausedClients, endedClients, monthlyTrend, availableMonths });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return { stats, loading };
}

export type ScheduleStatus = "pending" | "completed" | "cancelled";

export interface Session {
  id: string;
  date: string;
  startTime: string;
  number: number;
  duration: number;
  focus: string;
  note: string;
  reflection: string;
  tags: string[];
  status: ScheduleStatus;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

export interface Client {
  id: string;
  alias: string;
  status: "active" | "paused" | "ended";
  color: string | null;
  startDate: string;
  lastSessionDate: string;
  totalSessions: number;
  totalSupervisions: number;
  days: number;
  notes: string;
  sessions: Session[];
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
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  number?: number;
  totalSessions?: number;
  clientStartDate?: string;
  clientColor?: string | null;
  relatedClients?: { id: string; alias: string }[];
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  defaultDuration: number;
  useSoap: boolean;
}

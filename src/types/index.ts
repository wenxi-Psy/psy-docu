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
  // SOAP fields (optional for backward compatibility)
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

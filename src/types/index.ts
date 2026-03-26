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
}

export interface Client {
  id: string;
  alias: string;
  status: "active" | "paused" | "ended";
  startDate: string;
  lastSessionDate: string;
  totalSessions: number;
  totalSupervisions: number;
  days: number;
  notes: string;
  sessions: Session[];
}

import { TIME_START, TIME_END, HOUR_HEIGHT } from "./constants";

export function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getWeekDays(base: Date) {
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

export function endTime(start: string, dur: number) {
  const [h, m] = start.split(":").map(Number);
  const t = h * 60 + m + dur;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export function timeToY(startTime: string) {
  const [h, m] = startTime.split(":").map(Number);
  return ((h - TIME_START) * 60 + m) / 60 * HOUR_HEIGHT;
}

export function durationToHeight(minutes: number) {
  return (minutes / 60) * HOUR_HEIGHT;
}

export function getCurrentTimeY(): number | null {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < TIME_START || h >= TIME_END) return null;
  return ((h - TIME_START) * 60 + m) / 60 * HOUR_HEIGHT;
}

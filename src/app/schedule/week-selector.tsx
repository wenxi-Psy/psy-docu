"use client";

import { WEEKDAYS } from "./constants";
import { fmt, getWeekDays } from "./utils";

interface Props {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  onWeekChange: (offset: number) => void;
  datesWithItems: Set<string>;
}

export function WeekSelector({ selectedDate, onDateChange, onWeekChange, datesWithItems }: Props) {
  const weekDays = getWeekDays(selectedDate);
  const dateStr = fmt(selectedDate);
  const todayStr = fmt(new Date());

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onWeekChange(-7)} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div className="flex flex-1 gap-1 justify-between">
        {weekDays.map((d) => {
          const ds = fmt(d);
          const sel = dateStr === ds;
          const today = todayStr === ds;
          const has = datesWithItems.has(ds);
          return (
            <button key={ds} onClick={() => onDateChange(d)}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2.5 rounded-xl transition-all ${
                sel ? "bg-primary text-white" : today ? "bg-primary-container/50 text-primary" : "hover:bg-surface-container-low text-on-surface"
              }`}>
              <span className="text-[10px] font-medium opacity-70">{WEEKDAYS[d.getDay()]}</span>
              <span className="text-sm font-bold">{d.getDate()}</span>
              <div className={`w-1 h-1 rounded-full ${has ? (sel ? "bg-white/70" : "bg-primary") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
      <button onClick={() => onWeekChange(7)} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}

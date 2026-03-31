"use client";

import { ScheduleItem } from "@/hooks/useSchedule";
import { WEEKDAYS, TYPE_CONFIG } from "./constants";
import { fmt, getWeekDays } from "./utils";

interface Props {
  selectedDate: Date;
  getItemsForDate: (date: string) => ScheduleItem[];
  onDayClick: (date: Date) => void;
}

export function WeekView({ selectedDate, getItemsForDate, onDayClick }: Props) {
  const weekDays = getWeekDays(selectedDate);
  const todayStr = fmt(new Date());

  return (
    <div className="grid grid-cols-7 gap-1 flex-1">
      {weekDays.map((d) => {
        const ds = fmt(d);
        const items = getItemsForDate(ds);
        const isToday = todayStr === ds;

        return (
          <button
            key={ds}
            onClick={() => onDayClick(d)}
            className={`flex flex-col rounded-xl p-2 min-h-[200px] text-left transition-colors ${
              isToday ? "bg-primary-container/20 border border-primary/20" : "bg-surface-container-lowest border border-outline-variant/50 hover:border-primary/20"
            }`}
          >
            <div className={`text-center mb-2 pb-2 border-b border-outline-variant/30`}>
              <div className="text-[10px] text-on-surface-variant">{WEEKDAYS[d.getDay()]}</div>
              <div className={`text-sm font-bold ${isToday ? "text-primary" : "text-on-surface"}`}>{d.getDate()}</div>
            </div>
            <div className="flex-1 space-y-1">
              {items.length === 0 && (
                <div className="text-[10px] text-on-surface-variant/50 text-center mt-4">无安排</div>
              )}
              {items.map((item) => {
                const config = TYPE_CONFIG[item.type];
                const isCompleted = item.status === "completed";
                const isCancelled = item.status === "cancelled";
                return (
                  <div key={item.id} className={`rounded-lg px-1.5 py-1 ${config.bg} border ${config.border} ${isCompleted ? "opacity-75" : ""} ${isCancelled ? "opacity-40" : ""}`}>
                    <div className="text-[10px] text-on-surface-variant">{item.startTime}</div>
                    <div className={`text-[11px] font-medium ${config.text} truncate`}>
                      {item.status === "completed" && "✓ "}
                      {item.type === "consultation" ? item.clientAlias : item.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";
import { TIME_START, TIME_END, HOUR_HEIGHT } from "./constants";
import { timeToY, durationToHeight, getCurrentTimeY, fmt } from "./utils";
import { DayEventCard } from "./day-event-card";
import { CurrentTimeIndicator } from "./current-time-indicator";

interface Props {
  items: ScheduleItem[];
  selectedItemId: string | null;
  onItemClick: (id: string) => void;
  isToday: boolean;
}

const hours = Array.from({ length: TIME_END - TIME_START }, (_, i) => TIME_START + i);

export function DayView({ items, selectedItemId, onItemClick, isToday }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isToday && scrollRef.current) {
      const y = getCurrentTimeY();
      if (y !== null) {
        scrollRef.current.scrollTop = Math.max(0, y - 200);
      }
    }
  }, [isToday]);

  const totalHeight = (TIME_END - TIME_START) * HOUR_HEIGHT;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="relative flex" style={{ height: totalHeight }}>
        {/* Time scale */}
        <div className="w-14 flex-shrink-0 relative">
          {hours.map((h) => (
            <div key={h} className="absolute text-xs text-on-surface-variant font-medium" style={{ top: (h - TIME_START) * HOUR_HEIGHT - 8 }}>
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Event area */}
        <div className="flex-1 relative ml-2">
          {/* Hour grid lines */}
          {hours.map((h) => (
            <div key={h} className="absolute left-0 right-0 border-t border-outline-variant/50" style={{ top: (h - TIME_START) * HOUR_HEIGHT }} />
          ))}
          {/* Half-hour dashed lines */}
          {hours.map((h) => (
            <div key={`half-${h}`} className="absolute left-0 right-0 border-t border-dashed border-outline-variant/30" style={{ top: (h - TIME_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
          ))}

          {/* Events */}
          {items.map((item) => (
            <DayEventCard
              key={item.id}
              item={item}
              top={timeToY(item.startTime)}
              height={durationToHeight(item.duration)}
              selected={selectedItemId === item.id}
              onClick={() => onItemClick(item.id)}
            />
          ))}

          {/* Current time */}
          {isToday && <CurrentTimeIndicator />}
        </div>
      </div>
    </div>
  );
}

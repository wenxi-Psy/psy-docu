"use client";

import { ScheduleItem } from "@/hooks/useSchedule";
import { TYPE_CONFIG } from "./constants";
import { endTime } from "./utils";

interface Props {
  item: ScheduleItem;
  top: number;
  height: number;
  selected: boolean;
  onClick: () => void;
}

export function DayEventCard({ item, top, height, selected, onClick }: Props) {
  const config = TYPE_CONFIG[item.type];
  const displayHeight = Math.max(height, 32);
  const compact = height < 48;

  return (
    <button
      onClick={onClick}
      style={{ top, height: displayHeight }}
      className={`absolute left-1 right-1 rounded-xl px-3 py-1.5 border text-left transition-all overflow-hidden ${config.bg} ${config.border} ${
        selected ? "ring-2 ring-primary/30 shadow-sm" : "hover:shadow-sm"
      }`}
    >
      {compact ? (
        <div className="flex items-center gap-2 h-full">
          <span className="text-xs">{config.emoji}</span>
          <span className={`text-xs font-semibold ${config.text} truncate`}>
            {item.type === "consultation" ? item.clientAlias : item.title}
          </span>
          <span className="text-[10px] text-on-surface-variant ml-auto flex-shrink-0">{item.startTime}</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{config.emoji}</span>
            <span className={`text-sm font-semibold ${config.text} truncate`}>
              {item.type === "consultation" ? item.clientAlias : item.title}
            </span>
            {item.number && <span className="text-[10px] text-on-surface-variant">第{item.number}次</span>}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            {item.startTime} - {endTime(item.startTime, item.duration)}
          </div>
          {!compact && item.focus && (
            <div className="text-xs text-on-surface-variant mt-0.5 truncate">{item.focus}</div>
          )}
        </>
      )}
    </button>
  );
}

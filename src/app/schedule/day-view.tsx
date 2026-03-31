"use client";

import { useMemo } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";
import { TYPE_CONFIG } from "./constants";
import { endTime } from "./utils";

interface Props {
  items: ScheduleItem[];
  selectedItemId: string | null;
  onItemClick: (id: string) => void;
  isToday: boolean;
}

interface TimeSegment {
  label: string;
  startHour: number;
  endHour: number;
  items: ScheduleItem[];
}

function getSegments(items: ScheduleItem[]): TimeSegment[] {
  const segments: TimeSegment[] = [
    { label: "上午", startHour: 6, endHour: 12, items: [] },
    { label: "下午", startHour: 12, endHour: 18, items: [] },
    { label: "晚上", startHour: 18, endHour: 23, items: [] },
  ];

  for (const item of items) {
    const h = parseInt(item.startTime.split(":")[0]);
    const seg = segments.find((s) => h >= s.startHour && h < s.endHour);
    if (seg) seg.items.push(item);
  }

  return segments;
}

function EventCard({ item, selected, onClick }: { item: ScheduleItem; selected: boolean; onClick: () => void }) {
  const config = TYPE_CONFIG[item.type];
  const end = endTime(item.startTime, item.duration);
  const isCompleted = item.status === "completed";
  const isCancelled = item.status === "cancelled";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 border transition-all ${config.bg} ${config.border} ${
        selected ? "ring-2 ring-primary/30 shadow-md" : "hover:shadow-sm"
      } ${isCompleted ? "opacity-75" : ""} ${isCancelled ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type + Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{config.emoji}</span>
            <span className={`text-[15px] font-semibold ${config.text}`}>
              {item.type === "consultation" ? item.clientAlias : item.title}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60 text-on-surface-variant font-medium">{config.label}</span>
            {item.number && <span className="text-xs text-on-surface-variant">第{item.number}次</span>}
            {item.status === "completed" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-container/50 text-primary font-medium">✓ 已完成</span>
            )}
            {item.status === "cancelled" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-medium">已取消</span>
            )}
          </div>

          {/* Time */}
          <div className="text-sm text-on-surface-variant mb-1">
            {item.startTime} – {end}
            <span className="ml-1.5 opacity-70">({item.duration}分钟)</span>
          </div>

          {/* Focus */}
          {item.focus && (
            <p className="text-sm text-on-surface/80 mt-1">{item.focus}</p>
          )}

          {/* Related clients (supervision) */}
          {item.relatedClients && item.relatedClients.length > 0 && (
            <p className="text-xs text-on-surface-variant mt-1">
              关联个案：{item.relatedClients.map((c) => c.alias).join("、")}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {item.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white/50 text-on-surface-variant">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Duration indicator */}
        <div className={`w-1 self-stretch rounded-full ${config.text} opacity-30`} style={{ backgroundColor: "currentColor" }} />
      </div>
    </button>
  );
}

function SegmentSection({ segment, selectedItemId, onItemClick, isToday }: {
  segment: TimeSegment;
  selectedItemId: string | null;
  onItemClick: (id: string) => void;
  isToday: boolean;
}) {
  const hasItems = segment.items.length > 0;

  const now = new Date();
  const currentHour = now.getHours();
  const isCurrentSegment = isToday && currentHour >= segment.startHour && currentHour < segment.endHour;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className={`text-sm font-semibold ${isCurrentSegment ? "text-primary" : "text-on-surface-variant"}`}>
          {segment.label}
        </h3>
        <div className="flex-1 h-px bg-outline-variant/50" />
        {isCurrentSegment && (
          <span className="text-[11px] text-[#e53935] font-medium">NOW</span>
        )}
        {!hasItems && (
          <span className="text-xs text-on-surface-variant/50">无安排</span>
        )}
      </div>

      {hasItems && (
        <div className="space-y-3 ml-4 pl-4 border-l-2 border-outline-variant/30">
          {segment.items.map((item) => (
            <div key={item.id} className="relative">
              <div className={`absolute -left-[21px] top-5 w-2.5 h-2.5 rounded-full border-2 ${
                item.status === "completed"
                  ? "bg-primary border-primary/30"
                  : item.status === "cancelled"
                  ? "bg-surface-dim border-surface-dim"
                  : "bg-surface-container-low border-on-surface-variant/30"
              }`} />
              <EventCard
                item={item}
                selected={selectedItemId === item.id}
                onClick={() => onItemClick(item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DayView({ items, selectedItemId, onItemClick, isToday }: Props) {
  const segments = useMemo(() => getSegments(items), [items]);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-30">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-sm">这一天没有安排</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 py-2">
      {segments.map((seg) => (
        <SegmentSection
          key={seg.label}
          segment={seg}
          selectedItemId={selectedItemId}
          onItemClick={onItemClick}
          isToday={isToday}
        />
      ))}
    </div>
  );
}

"use client";

import { WEEKDAYS } from "./constants";

type ViewMode = "day" | "week";

interface Props {
  selectedDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dayItemCount: number;
  consultationCount: number;
  onAddClick: () => void;
  onTodayClick: () => void;
  isToday: boolean;
}

export function ScheduleControlBar({ selectedDate, viewMode, onViewModeChange, consultationCount, onAddClick, onTodayClick, isToday }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-on-surface">
          {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
          <span className="font-normal text-on-surface-variant ml-2">{WEEKDAYS[selectedDate.getDay()]}</span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {isToday
            ? consultationCount > 0 ? `今日共有 ${consultationCount} 场咨询预约` : "今日无咨询预约"
            : consultationCount > 0 ? `${consultationCount} 场咨询预约` : "无咨询预约"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!isToday && (
          <button onClick={onTodayClick} className="text-xs text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-primary-container/30 transition-colors">
            回到今天
          </button>
        )}
        <div className="flex bg-surface-container-low rounded-full p-0.5">
          {(["day", "week"] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => onViewModeChange(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === m ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
              {m === "day" ? "日" : "周"}
            </button>
          ))}
        </div>
        <button onClick={onAddClick} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          新建安排
        </button>
      </div>
    </div>
  );
}

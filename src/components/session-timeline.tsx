"use client";

import { Session } from "@/types";

interface SessionTimelineProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
  selectedId?: string;
}

export function SessionTimeline({ sessions, onSelect, selectedId }: SessionTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-sm text-on-surface-variant">暂无咨询记录</p>
        <a href="/schedule" className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors">
          去日程页安排首次咨询
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      </div>
    );
  }

  // Sort: pending future sessions first, then completed/cancelled by date desc
  const pending = sessions.filter((s) => s.status === "pending").sort((a, b) => a.date.localeCompare(b.date));
  const rest = sessions.filter((s) => s.status !== "pending");
  const sorted = [...pending, ...rest];

  return (
    <div className="space-y-0">
      {sorted.map((s, i) => {
        const isPending = s.status === "pending";
        const isCancelled = s.status === "cancelled";
        return (
          <button key={s.id} onClick={() => onSelect(s)}
            className={`w-full text-left flex gap-4 py-3 transition-colors ${selectedId === s.id ? "bg-primary-container/20 -mx-3 px-3 rounded-2xl" : "hover:bg-surface-container-low -mx-3 px-3 rounded-2xl"}`}>
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 border-2 ${
                isPending ? "border-primary bg-white" :
                isCancelled ? "border-surface-dim bg-surface-dim" :
                i === 0 || (pending.length > 0 && i === pending.length) ? "bg-primary border-primary" : "bg-surface-dim border-surface-dim"
              }`} />
              {i < sorted.length - 1 && <div className={`w-px flex-1 mt-1 ${isPending ? "border-l border-dashed border-primary/30" : "bg-outline-variant"}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-on-surface-variant">{s.date}</span>
                {!isPending && <span className="text-xs text-on-surface-variant">第 {s.number} 次咨询</span>}
                {isPending && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">待进行</span>
                )}
                {isCancelled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-medium">已取消</span>
                )}
                {s.status === "completed" && !s.focus && !s.note && !s.subjective && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-bg text-amber font-medium">待补填</span>
                )}
              </div>
              {s.focus && !isPending && <div className="text-sm text-on-surface mt-0.5 truncate">焦点：{s.focus}</div>}
              {isPending && <div className="text-sm text-on-surface-variant mt-0.5">{s.startTime} · {s.duration} 分钟</div>}
              {s.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {s.tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

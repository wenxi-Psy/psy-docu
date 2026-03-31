"use client";

import { Session } from "@/types";

interface SessionTimelineProps {
  sessions: Session[];
  onSelect: (session: Session) => void;
  selectedId?: string;
}

export function SessionTimeline({ sessions, onSelect, selectedId }: SessionTimelineProps) {
  if (sessions.length === 0) {
    return <p className="text-sm text-on-surface-variant py-4">暂无咨询记录</p>;
  }

  return (
    <div className="space-y-0">
      {sessions.map((s, i) => (
        <button key={s.id} onClick={() => onSelect(s)}
          className={`w-full text-left flex gap-4 py-3 transition-colors ${selectedId === s.id ? "bg-primary-container/20 -mx-3 px-3 rounded-2xl" : "hover:bg-surface-container-low -mx-3 px-3 rounded-2xl"}`}>
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === 0 ? "bg-primary" : "bg-surface-dim"}`} />
            {i < sessions.length - 1 && <div className="w-px flex-1 bg-outline-variant mt-1" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">{s.date}</span>
              <span className="text-xs text-on-surface-variant">第 {s.number} 次咨询</span>
            </div>
            {s.focus && <div className="text-sm text-on-surface mt-0.5">焦点：{s.focus}</div>}
            {s.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {s.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

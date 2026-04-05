"use client";

import { ScheduleItem } from "@/hooks/useSchedule";
import { TYPE_CONFIG } from "./constants";
import { getClientColor } from "@/lib/client-colors";
import { endTime } from "./utils";

const STATUS_DISPLAY = {
  pending: { label: "待进行", class: "bg-amber-bg text-amber" },
  completed: { label: "已完成", class: "bg-primary-container/50 text-primary" },
  cancelled: { label: "已取消", class: "bg-surface-container-low text-on-surface-variant" },
} as const;

interface Props {
  item: ScheduleItem | null;
  onClose: () => void;
  onComplete: (item: ScheduleItem) => void;
  onCancel: (item: ScheduleItem) => void;
  onEditSchedule: (item: ScheduleItem) => void;
  onEditRecord: (item: ScheduleItem) => void;
  onRevert: (item: ScheduleItem) => void;
}

export function DetailPanel({ item, onClose, onComplete, onCancel, onEditSchedule, onEditRecord, onRevert }: Props) {
  if (!item) return null;

  const config = item.type === "consultation"
    ? (() => { const cc = getClientColor(item.clientColor); return { ...TYPE_CONFIG.consultation, bg: cc.bg, border: cc.border, text: cc.text }; })()
    : TYPE_CONFIG[item.type];
  const end = endTime(item.startTime, item.duration);
  const statusDisplay = STATUS_DISPLAY[item.status];

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>{config.emoji}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${config.bg} ${config.text} font-medium`}>{config.label}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusDisplay.class} font-medium`}>
              {item.status === "completed" && "✓ "}{statusDisplay.label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">
            {item.type === "consultation" ? item.clientAlias : item.title}
          </h3>
          {item.type === "consultation" && item.totalSessions && (
            <p className="text-sm text-on-surface-variant mt-0.5">累计 {item.totalSessions} 次咨询</p>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-low">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-on-surface">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        {item.startTime} – {end}
        <span className="text-on-surface-variant">({item.duration}分钟)</span>
      </div>

      {/* Focus */}
      {item.focus && (
        <div>
          <div className="text-xs text-on-surface-variant mb-1">焦点</div>
          <p className="text-sm text-on-surface">{item.focus}</p>
        </div>
      )}

      {/* Reflection (consultation only) */}
      {item.reflection && (
        <div className="bg-primary-container/30 rounded-2xl p-4">
          <div className="text-xs text-primary mb-1">反思</div>
          <p className="text-sm text-on-surface whitespace-pre-wrap">{item.reflection}</p>
        </div>
      )}

      {/* Related clients (supervision) */}
      {item.relatedClients && item.relatedClients.length > 0 && (
        <div>
          <div className="text-xs text-on-surface-variant mb-1.5">关联个案</div>
          <div className="flex flex-wrap gap-1.5">
            {item.relatedClients.map((c) => (
              <a key={c.id} href={`/?client=${c.id}`}
                className="text-xs px-2.5 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container hover:bg-secondary-container transition-colors">
                {c.alias}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-primary-container text-primary">{tag}</span>
          ))}
        </div>
      )}

      {/* Note */}
      {item.note && (
        <div className="bg-surface-container-low rounded-xl p-3">
          <div className="text-xs text-on-surface-variant mb-1">备注</div>
          <p className="text-sm text-on-surface whitespace-pre-wrap">{item.note}</p>
        </div>
      )}

      {/* Cancel reason */}
      {item.status === "cancelled" && item.cancelReason && (
        <div className="bg-error-container-bg rounded-xl p-3">
          <div className="text-xs text-error-container mb-1">取消原因</div>
          <p className="text-sm text-on-surface whitespace-pre-wrap">{item.cancelReason}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2 pt-2">
        <button onClick={() => onEditSchedule(item)}
          className="w-full py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
          编辑日程
        </button>
        {item.status === "pending" && (
          <>
            <button onClick={() => onComplete(item)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
              ✓ 完成
            </button>
            <button onClick={() => onCancel(item)}
              className="w-full py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
              取消日程
            </button>
          </>
        )}
        {item.status === "completed" && (
          <>
            {item.type !== "other" && (
              <button onClick={() => onEditRecord(item)}
                className="w-full py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                编辑记录
              </button>
            )}
            <button onClick={() => onRevert(item)}
              className="w-full py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
              标记为待进行
            </button>
          </>
        )}
        {item.status === "cancelled" && (
          <button onClick={() => onRevert(item)}
            className="w-full py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
            恢复日程
          </button>
        )}
      </div>

      {/* Link to client */}
      {item.type === "consultation" && item.clientId && (
        <a href={`/?client=${item.clientId}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors">
          查看个案详情
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </a>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: side panel */}
      <div className="hidden md:block w-80 flex-shrink-0 border-l border-outline-variant/50 pl-6 overflow-y-auto">
        {content}
      </div>

      {/* Mobile: bottom sheet overlay */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-surface rounded-t-3xl shadow-lifted p-5 overflow-y-auto max-h-[75vh] pb-[calc(env(safe-area-inset-bottom)+72px)]">
        <div className="w-10 h-1 rounded-full bg-surface-dim mx-auto mb-4" />
        {content}
      </div>
    </>
  );
}

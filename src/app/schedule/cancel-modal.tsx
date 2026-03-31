"use client";

import { useState } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";

interface Props {
  item: ScheduleItem;
  onClose: () => void;
  onSubmit: (item: ScheduleItem, reason: string) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

export function CancelModal({ item, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const ok = await onSubmit(item, reason);
    setSubmitting(false);
    if (ok) onClose();
  };

  const typeLabel = item.type === "consultation" ? "咨询" : item.type === "supervision" ? "督导" : "日程";
  const itemName = item.type === "consultation" ? item.clientAlias : item.title;

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 pb-3">
          <h2 className="text-lg font-bold text-on-surface tracking-tight">取消{typeLabel}</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">{itemName}</p>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">取消原因（可选）</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="如：来访者请假、时间冲突等" className={inputClass + " resize-none"} autoFocus />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant">返回</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-error-container text-white text-sm font-medium disabled:opacity-40 transition-colors">
              {submitting ? "取消中..." : "确认取消"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

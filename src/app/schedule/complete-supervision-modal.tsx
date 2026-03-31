"use client";

import { useState } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";

interface Props {
  item: ScheduleItem;
  onClose: () => void;
  onSubmit: (eventId: string, note?: string) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

export function CompleteSupervisionModal({ item, onClose, onSubmit }: Props) {
  const [note, setNote] = useState(item.note ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const ok = await onSubmit(item.id, note);
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">完成督导记录</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {item.relatedClients && item.relatedClients.length > 0 && (
            <div>
              <div className="text-xs text-on-surface-variant font-medium mb-1.5">关联个案</div>
              <div className="flex flex-wrap gap-1.5">
                {item.relatedClients.map((c) => (
                  <span key={c.id} className="text-xs px-2.5 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container">{c.alias}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">督导记录</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="记录督导要点、反馈、行动计划等" className={inputClass + " resize-none"} />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant">取消</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 transition-colors">
              {submitting ? "保存中..." : "完成并保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

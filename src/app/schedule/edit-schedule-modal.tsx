"use client";

import { useState } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";

interface Client {
  id: string;
  alias: string;
}

interface Props {
  item: ScheduleItem;
  clients: Client[];
  conflictChecker: (date: string, startTime: string, duration: number, excludeId?: string) => ScheduleItem[];
  onSubmit: (updates: { date: string; startTime: string; duration: number; title?: string; clientIds?: string[] }) => Promise<boolean>;
  onClose: () => void;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

export function EditScheduleModal({ item, clients, conflictChecker, onSubmit, onClose }: Props) {
  const [date, setDate] = useState(item.date);
  const [startTime, setStartTime] = useState(item.startTime);
  const [duration, setDuration] = useState(item.duration);
  const [title, setTitle] = useState(item.title);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(
    item.relatedClients?.map((c) => c.id) ?? []
  );
  const [submitting, setSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [confirmedConflict, setConfirmedConflict] = useState(false);

  const toggleClient = (id: string) =>
    setSelectedClientIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSubmit = async () => {
    // Check conflicts unless already confirmed
    if (!confirmedConflict) {
      const conflicts = conflictChecker(date, startTime, duration, item.id);
      if (conflicts.length > 0) {
        const names = conflicts.map((c) => `「${c.type === "consultation" ? c.clientAlias : c.title} ${c.startTime}」`).join("、");
        setConflictWarning(`该时段与 ${names} 冲突`);
        return;
      }
    }

    setSubmitting(true);
    const updates: { date: string; startTime: string; duration: number; title?: string; clientIds?: string[] } = {
      date, startTime, duration,
    };
    if (item.type === "supervision") {
      updates.title = title;
      updates.clientIds = selectedClientIds;
    } else if (item.type === "other") {
      updates.title = title;
    }
    const ok = await onSubmit(updates);
    setSubmitting(false);
    if (ok) onClose();
  };

  const handleConfirmConflict = () => {
    setConfirmedConflict(true);
    setConflictWarning(null);
    handleSubmit();
  };

  // Reset conflict state when time changes
  const updateField = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setConflictWarning(null);
    setConfirmedConflict(false);
  };

  const typeLabel = item.type === "consultation" ? "咨询" : item.type === "supervision" ? "督导" : "其他";
  const itemName = item.type === "consultation" ? item.clientAlias : item.title;

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">编辑{typeLabel}时间</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{itemName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {/* Title (supervision / other only) */}
          {item.type !== "consultation" && (
            <div>
              <label className="text-xs text-on-surface-variant font-medium block mb-1.5">标题</label>
              <input value={title} onChange={(e) => updateField(setTitle)(e.target.value)} className={inputClass} />
            </div>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-on-surface-variant font-medium block mb-1.5">日期</label>
              <input type="date" value={date} onChange={(e) => updateField(setDate)(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant font-medium block mb-1.5">开始时间</label>
              <input type="time" value={startTime} onChange={(e) => updateField(setStartTime)(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">时长（分钟）</label>
            <input type="number" min={1} max={480} value={duration} onChange={(e) => updateField(setDuration)(Math.max(1, Number(e.target.value)))} className={inputClass} />
          </div>

          {/* Related clients (supervision only) */}
          {item.type === "supervision" && clients.length > 0 && (
            <div>
              <label className="text-xs text-on-surface-variant font-medium block mb-1.5">关联个案（可选）</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {clients.map((c) => (
                  <button key={c.id} type="button" onClick={() => toggleClient(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedClientIds.includes(c.id)
                        ? "bg-primary text-white border-primary"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/30"
                    }`}>
                    {c.alias}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conflict warning */}
          {conflictWarning && (
            <div className="bg-amber-bg rounded-xl p-3 space-y-2">
              <p className="text-sm text-amber">{conflictWarning}</p>
              <div className="flex gap-2">
                <button onClick={() => { setConflictWarning(null); }} className="flex-1 py-2 rounded-lg border border-outline-variant text-xs text-on-surface-variant">
                  返回修改
                </button>
                <button onClick={handleConfirmConflict} className="flex-1 py-2 rounded-lg bg-amber text-white text-xs font-medium">
                  仍然保存
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          {!conflictWarning && (
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant">取消</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 transition-colors">
                {submitting ? "保存中..." : "保存"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

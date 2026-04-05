"use client";

import { useState } from "react";
import { ColorPicker } from "./color-picker";

interface AddClientModalProps {
  onClose: () => void;
  onSubmit: (client: { alias: string; notes: string; color?: string }) => Promise<string | null>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 transition-colors";

export function AddClientModal({ onClose, onSubmit }: AddClientModalProps) {
  const [alias, setAlias] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!alias.trim()) return;
    setSubmitting(true);
    const ok = await onSubmit({ alias: alias.trim(), notes, color: color ?? undefined });
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="text-lg font-bold text-on-surface tracking-tight">新建个案</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">个案代称</label><input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="如：晨光" className={inputClass} autoFocus /></div>
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="主要议题、来源等" className={inputClass + " resize-none"} /></div>
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">日程颜色</label><ColorPicker value={color} onChange={setColor} /></div>
          <button onClick={handleSubmit} disabled={!alias.trim() || submitting} className="w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-40 transition-colors shadow-ambient">
            {submitting ? "创建中..." : "创建个案"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Client } from "@/types";

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
  onUpdate: (id: string, updates: { alias?: string; notes?: string; status?: string }) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 transition-colors";

export function EditClientModal({ client, onClose, onUpdate }: EditClientModalProps) {
  const [alias, setAlias] = useState(client.alias);
  const [notes, setNotes] = useState(client.notes);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!alias.trim()) return;
    setSubmitting(true);
    const ok = await onUpdate(client.id, { alias: alias.trim(), notes });
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="text-lg font-bold text-on-surface tracking-tight">编辑个案</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">个案代称</label><input value={alias} onChange={(e) => setAlias(e.target.value)} className={inputClass} /></div>
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass + " resize-none"} /></div>
          <button onClick={handleSave} disabled={submitting} className="w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover disabled:opacity-40 transition-colors shadow-ambient">
            {submitting ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

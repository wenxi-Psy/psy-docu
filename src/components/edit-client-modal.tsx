"use client";

import { useState } from "react";
import { Client } from "@/types";

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
  onUpdate: (id: string, updates: { alias?: string; notes?: string; status?: string }) => Promise<boolean>;
}

export function EditClientModal({ client, onClose, onUpdate }: EditClientModalProps) {
  const [alias, setAlias] = useState(client.alias);
  const [notes, setNotes] = useState(client.notes);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    await onUpdate(client.id, { alias, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold text-gray-900">编辑个案</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div><label className="text-xs text-gray-400 block mb-1">个案代称</label><input value={alias} onChange={(e) => setAlias(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">备注</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 resize-none" /></div>
          <button onClick={handleSave} disabled={submitting} className="w-full py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-40">
            {submitting ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

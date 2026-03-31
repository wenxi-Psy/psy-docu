"use client";

import { useState } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";
import { TagInput } from "@/components/tag-input";

interface Props {
  item: ScheduleItem;
  allTags: string[];
  onClose: () => void;
  onSubmit: (sessionId: string, updates: { focus: string; note: string; reflection: string; tags: string[] }) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

export function CompleteConsultationModal({ item, allTags, onClose, onSubmit }: Props) {
  const [focus, setFocus] = useState(item.focus ?? "");
  const [note, setNote] = useState(item.note ?? "");
  const [reflection, setReflection] = useState(item.reflection ?? "");
  const [tags, setTags] = useState<string[]>(item.tags ?? []);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(item.id, { focus, note, reflection, tags });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">完成咨询记录</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{item.clientAlias} · 第{item.number}次</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">焦点</label><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="本次咨询焦点" className={inputClass} /></div>
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">笔记</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="咨询笔记" className={inputClass + " resize-none"} /></div>
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">反思</label>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} placeholder="咨询后反思" className={inputClass + " resize-none"} />
          </div>
          <div><label className="text-xs text-on-surface-variant font-medium block mb-1.5">标签</label><TagInput tags={tags} allTags={allTags} onChange={setTags} /></div>
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

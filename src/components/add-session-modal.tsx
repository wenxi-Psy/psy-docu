"use client";

import { useState } from "react";
import { TagInput } from "./tag-input";

interface AddSessionModalProps {
  clientAlias: string;
  allTags: string[];
  onClose: () => void;
  onSubmit: (session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[] }) => void;
  onDeleteTag?: (tag: string) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

export function AddSessionModal({ clientAlias, allTags, onClose, onSubmit, onDeleteTag }: AddSessionModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState(50);
  const [focus, setFocus] = useState("");
  const [note, setNote] = useState("");
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = () => {
    onSubmit({ date, startTime, duration, focus, note, reflection, tags });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="text-lg font-bold text-on-surface tracking-tight">添加咨询记录 · {clientAlias}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-on-surface-variant block mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
            <div><label className="text-xs text-on-surface-variant block mb-1">开始时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></div>
          </div>
          <div><label className="text-xs text-on-surface-variant block mb-1">时长（分钟）</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} /></div>
          <div><label className="text-xs text-on-surface-variant block mb-1">焦点</label><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="本次咨询焦点" className={inputClass} /></div>
          <div><label className="text-xs text-on-surface-variant block mb-1">笔记</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="咨询笔记" className={inputClass + " resize-none"} /></div>
          <div><label className="text-xs text-on-surface-variant block mb-1">反思</label><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={2} placeholder="咨询后反思" className={inputClass + " resize-none"} /></div>
          <div><label className="text-xs text-on-surface-variant block mb-1">标签</label><TagInput tags={tags} allTags={allTags} onChange={setTags} onDeleteTag={onDeleteTag} /></div>
          <button onClick={handleSubmit} className="w-full py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-ambient">提交并存档</button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold text-gray-900">添加咨询记录 · {clientAlias}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 block mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">开始时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" /></div>
          </div>
          <div><label className="text-xs text-gray-400 block mb-1">时长（分钟）</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">焦点</label><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="本次咨询焦点" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">笔记</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="咨询笔记" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 resize-none" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">反思</label><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={2} placeholder="咨询后反思" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-600 resize-none" /></div>
          <div><label className="text-xs text-gray-400 block mb-1">标签</label><TagInput tags={tags} allTags={allTags} onChange={setTags} onDeleteTag={onDeleteTag} /></div>
          <button onClick={handleSubmit} className="w-full py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800">提交并存档</button>
        </div>
      </div>
    </div>
  );
}

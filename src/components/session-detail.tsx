"use client";

import { useState } from "react";
import { Session } from "@/types";
import { TagInput } from "./tag-input";

interface SessionDetailProps {
  session: Session;
  allTags: string[];
  onUpdate: (sessionId: string, updates: Partial<Session> & { startTime?: string }) => Promise<boolean>;
  onDeleteTag?: (tag: string) => Promise<boolean>;
}

export function SessionDetail({ session, allTags, onUpdate, onDeleteTag }: SessionDetailProps) {
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState(session.focus);
  const [note, setNote] = useState(session.note);
  const [reflection, setReflection] = useState(session.reflection);
  const [tags, setTags] = useState(session.tags);
  const [date, setDate] = useState(session.date);
  const [startTime, setStartTime] = useState(session.startTime);
  const [duration, setDuration] = useState(session.duration);

  const handleSave = async () => {
    await onUpdate(session.id, { focus, note, reflection, tags, date, startTime, duration });
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">第 {session.number} 次咨询</h3>
          <button onClick={() => setEditing(true)} className="text-xs text-green-700 hover:text-green-800">编辑</button>
        </div>
        <div className="text-xs text-gray-400">{session.date} · {session.startTime} · {session.duration}分钟</div>
        {session.focus && <div><div className="text-xs text-gray-400 mb-1">焦点</div><p className="text-sm text-gray-900">{session.focus}</p></div>}
        {session.note && <div><div className="text-xs text-gray-400 mb-1">笔记</div><p className="text-sm text-gray-700 whitespace-pre-wrap">{session.note}</p></div>}
        {session.reflection && (
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-xs text-green-600 mb-1">反思</div>
            <p className="text-sm text-green-800 whitespace-pre-wrap">{session.reflection}</p>
          </div>
        )}
        {session.tags.length > 0 && (
          <div className="flex gap-1.5">{session.tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">{t}</span>
          ))}</div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-green-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">编辑第 {session.number} 次咨询</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="text-xs text-gray-400">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm" /></div>
        <div><label className="text-xs text-gray-400">时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm" /></div>
        <div><label className="text-xs text-gray-400">时长</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm" /></div>
      </div>
      <div><label className="text-xs text-gray-400">焦点</label><input value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm" /></div>
      <div><label className="text-xs text-gray-400">笔记</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm resize-none" /></div>
      <div><label className="text-xs text-gray-400">反思</label><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm resize-none" /></div>
      <div><label className="text-xs text-gray-400">标签</label><TagInput tags={tags} allTags={allTags} onChange={setTags} onDeleteTag={onDeleteTag} /></div>
      <div className="flex gap-2">
        <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">取消</button>
        <button onClick={handleSave} className="flex-1 py-2 rounded-xl bg-green-700 text-white text-sm">保存</button>
      </div>
    </div>
  );
}

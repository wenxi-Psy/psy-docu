"use client";

import { useState } from "react";
import { Session } from "@/types";
import { TagInput } from "./tag-input";

interface SessionDetailProps {
  session: Session;
  allTags: string[];
  useSoap?: boolean;
  onUpdate: (sessionId: string, updates: Partial<Session> & { startTime?: string }) => Promise<boolean>;
  onDeleteTag?: (tag: string) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";
const textareaClass = inputClass + " resize-none";

const SOAP_LABELS: { key: keyof Session; letter: string; label: string; color: string }[] = [
  { key: "subjective", letter: "S", label: "主诉", color: "text-[#5b8a6b]" },
  { key: "objective", letter: "O", label: "观察", color: "text-[#5b7a8a]" },
  { key: "assessment", letter: "A", label: "评估", color: "text-[#7a6b8a]" },
  { key: "plan", letter: "P", label: "计划", color: "text-[#8a7a5b]" },
];

export function SessionDetail({ session, allTags, useSoap = false, onUpdate, onDeleteTag }: SessionDetailProps) {
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState(session.focus);
  const [note, setNote] = useState(session.note);
  const [reflection, setReflection] = useState(session.reflection);
  const [tags, setTags] = useState(session.tags);
  const [date, setDate] = useState(session.date);
  const [startTime, setStartTime] = useState(session.startTime);
  const [duration, setDuration] = useState(session.duration);
  const [subjective, setSubjective] = useState(session.subjective ?? "");
  const [objective, setObjective] = useState(session.objective ?? "");
  const [assessment, setAssessment] = useState(session.assessment ?? "");
  const [plan, setPlan] = useState(session.plan ?? "");

  const [saving, setSaving] = useState(false);

  const hasSoapContent = !!(session.subjective || session.objective || session.assessment || session.plan);
  const showSoap = useSoap || hasSoapContent;

  const handleSave = async () => {
    setSaving(true);
    const updates: Partial<Session> & { startTime?: string } = {
      date, startTime, duration, tags,
    };
    if (showSoap) {
      updates.subjective = subjective;
      updates.objective = objective;
      updates.assessment = assessment;
      updates.plan = plan;
    } else {
      updates.focus = focus;
      updates.note = note;
      updates.reflection = reflection;
    }
    const ok = await onUpdate(session.id, updates);
    setSaving(false);
    if (ok) setEditing(false);
  };

  if (!editing) {
    return (
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-on-surface">第 {session.number} 次咨询</h3>
          <button onClick={() => setEditing(true)} className="text-xs text-primary hover:text-primary-hover transition-colors">编辑</button>
        </div>
        <div className="text-xs text-on-surface-variant">{session.date} · {session.startTime} · {session.duration}分钟</div>

        {showSoap ? (
          <div className="space-y-3">
            {SOAP_LABELS.map(({ key, letter, label, color }) => {
              const value = session[key] as string | undefined;
              if (!value) return null;
              return (
                <div key={key} className="bg-surface-container-low rounded-2xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-[10px] font-bold ${color}`}>{letter}</span>
                    <span className="text-xs text-on-surface-variant font-medium">{label}</span>
                  </div>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{value}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {session.focus && <div><div className="text-xs text-on-surface-variant mb-1">焦点</div><p className="text-sm text-on-surface">{session.focus}</p></div>}
            {session.note && <div><div className="text-xs text-on-surface-variant mb-1">笔记</div><p className="text-sm text-on-surface-variant whitespace-pre-wrap">{session.note}</p></div>}
            {session.reflection && (
              <div className="bg-primary-container/30 rounded-2xl p-4">
                <div className="text-xs text-primary mb-1">反思</div>
                <p className="text-sm text-on-surface whitespace-pre-wrap">{session.reflection}</p>
              </div>
            )}
          </>
        )}

        {session.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {session.tags.map((t) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">{t}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient border border-primary/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface">编辑第 {session.number} 次咨询</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="text-xs text-on-surface-variant">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
        <div><label className="text-xs text-on-surface-variant">时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></div>
        <div><label className="text-xs text-on-surface-variant">时长(分钟)</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} /></div>
      </div>

      {showSoap ? (
        <>
          {SOAP_LABELS.map(({ key, letter, label }) => (
            <div key={key}>
              <label className="text-xs text-on-surface-variant">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold mr-1">{letter}</span>
                {label}
              </label>
              <textarea
                value={{ subjective, objective, assessment, plan }[key as string] ?? ""}
                onChange={(e) => {
                  const setters: Record<string, (v: string) => void> = { subjective: setSubjective, objective: setObjective, assessment: setAssessment, plan: setPlan };
                  setters[key as string]?.(e.target.value);
                }}
                rows={3}
                className={textareaClass}
              />
            </div>
          ))}
        </>
      ) : (
        <>
          <div><label className="text-xs text-on-surface-variant">焦点</label><input value={focus} onChange={(e) => setFocus(e.target.value)} className={inputClass} /></div>
          <div><label className="text-xs text-on-surface-variant">笔记</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={textareaClass} /></div>
          <div><label className="text-xs text-on-surface-variant">反思</label><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} className={textareaClass} /></div>
        </>
      )}

      <div><label className="text-xs text-on-surface-variant">标签</label><TagInput tags={tags} allTags={allTags} onChange={setTags} onDeleteTag={onDeleteTag} /></div>
      <div className="flex gap-3">
        <button onClick={() => setEditing(false)} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant">取消</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40">{saving ? "保存中..." : "保存"}</button>
      </div>
    </div>
  );
}

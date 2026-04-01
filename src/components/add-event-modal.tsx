"use client";

import { useState } from "react";
import { EventType, ScheduleItem } from "@/hooks/useSchedule";

interface Client { id: string; alias: string; }

interface AddEventModalProps {
  clients: Client[];
  initialDate?: string;
  onClose: () => void;
  onSubmitEvent: (event: { type: EventType; title: string; date: string; startTime: string; duration: number; note: string; clientIds?: string[] }) => Promise<boolean>;
  onSubmitConsultation: (clientId: string, session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[] }, currentTotal: number) => Promise<boolean>;
  getClientTotal: (clientId: string) => number;
  checkConflict?: (date: string, startTime: string, duration: number, excludeId?: string) => ScheduleItem[];
}

type Step = "choose" | "consultation" | "supervision" | "other";

export function AddEventModal({ clients, initialDate, onClose, onSubmitEvent, onSubmitConsultation, getClientTotal, checkConflict }: AddEventModalProps) {
  const today = initialDate ?? new Date().toISOString().split("T")[0];
  const [step, setStep] = useState<Step>("choose");
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState(50);
  const [note, setNote] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [focus, setFocus] = useState("");
  const [title, setTitle] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [otherTitle, setOtherTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [confirmedConflict, setConfirmedConflict] = useState(false);

  const doSubmit = async () => {
    setSubmitting(true);
    let ok = false;
    try {
      if (step === "consultation" && selectedClientId) {
        ok = await onSubmitConsultation(selectedClientId, { date, startTime, duration, focus, note, reflection: "", tags: [] }, getClientTotal(selectedClientId));
      } else if (step === "supervision") {
        ok = await onSubmitEvent({ type: "supervision", title: title || "督导", date, startTime, duration, note, clientIds: selectedClientIds.length > 0 ? selectedClientIds : undefined });
      } else if (step === "other") {
        ok = await onSubmitEvent({ type: "other", title: otherTitle || "其他日程", date, startTime, duration, note });
      }
      if (ok) onClose();
    } finally { setSubmitting(false); }
  };

  const handleSubmit = async () => {
    if (!confirmedConflict && checkConflict) {
      const conflicts = checkConflict(date, startTime, duration);
      if (conflicts.length > 0) {
        const names = conflicts.map((c) => `「${c.type === "consultation" ? c.clientAlias : c.title} ${c.startTime}」`).join("、");
        setConflictWarning(`该时段与 ${names} 冲突`);
        return;
      }
    }
    await doSubmit();
  };

  const toggleClient = (id: string) => setSelectedClientIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

  return (
    <div className="fixed inset-0 bg-on-surface/20 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass rounded-[2rem] shadow-lifted w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-3">
          <h2 className="text-lg font-bold text-on-surface tracking-tight">
            {step === "choose" ? "新建日程" : step === "consultation" ? "新建咨询" : step === "supervision" ? "新建督导" : "新建其他日程"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">✕</button>
        </div>
        <div className="px-6 pb-6">
          {step === "choose" && (
            <div className="space-y-2">
              <p className="text-sm text-on-surface-variant mb-4">选择日程类型</p>
              {[
                { key: "consultation" as Step, icon: "🌱", label: "咨询", desc: "记录一次咨询，计入咨询统计" },
                { key: "supervision" as Step, icon: "📋", label: "督导", desc: "个案或团体督导，可关联个案" },
                { key: "other" as Step, icon: "📌", label: "其他", desc: "培训、写报告等，不计入统计" },
              ].map((opt) => (
                <button key={opt.key} onClick={() => { setStep(opt.key); setDuration(opt.key === "consultation" ? 50 : 60); }}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:border-primary/30 hover:bg-primary-container/20 transition-colors">
                  <span className="text-2xl">{opt.icon}</span>
                  <div><div className="text-sm font-semibold text-on-surface">{opt.label}</div><div className="text-xs text-on-surface-variant">{opt.desc}</div></div>
                </button>
              ))}
            </div>
          )}

          {step === "consultation" && (
            <div className="space-y-4">
              <div><label className="text-xs text-on-surface-variant block mb-1">选择个案</label>
                <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className={inputClass}>
                  <option value="">请选择...</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.alias}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-on-surface-variant block mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs text-on-surface-variant block mb-1">开始时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className="text-xs text-on-surface-variant block mb-1">时长（分钟）</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} /></div>
              <div><label className="text-xs text-on-surface-variant block mb-1">焦点</label><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="本次咨询焦点" className={inputClass} /></div>
              <div><label className="text-xs text-on-surface-variant block mb-1">备注</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="可选" className={inputClass + " resize-none"} /></div>
            </div>
          )}

          {step === "supervision" && (
            <div className="space-y-4">
              <div><label className="text-xs text-on-surface-variant block mb-1">督导标题</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：个案督导、团体督导" className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-on-surface-variant block mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs text-on-surface-variant block mb-1">开始时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className="text-xs text-on-surface-variant block mb-1">时长（分钟）</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} /></div>
              <div><label className="text-xs text-on-surface-variant block mb-1">关联个案（可选，可多选）</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {clients.map((c) => (
                    <button key={c.id} onClick={() => toggleClient(c.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedClientIds.includes(c.id) ? "bg-primary text-white border-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/30"}`}>
                      {c.alias}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="text-xs text-on-surface-variant block mb-1">备注</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="督导内容记录" className={inputClass + " resize-none"} /></div>
            </div>
          )}

          {step === "other" && (
            <div className="space-y-4">
              <div><label className="text-xs text-on-surface-variant block mb-1">标题</label><input value={otherTitle} onChange={(e) => setOtherTitle(e.target.value)} placeholder="如：培训、写报告" className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-on-surface-variant block mb-1">日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs text-on-surface-variant block mb-1">开始时间</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></div>
              </div>
              <div><label className="text-xs text-on-surface-variant block mb-1">时长（分钟）</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} /></div>
              <div><label className="text-xs text-on-surface-variant block mb-1">备注</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="可选" className={inputClass + " resize-none"} /></div>
            </div>
          )}

          {step !== "choose" && conflictWarning && (
            <div className="bg-amber-bg rounded-xl p-3 mt-4 space-y-2">
              <p className="text-sm text-amber">{conflictWarning}</p>
              <div className="flex gap-2">
                <button onClick={() => setConflictWarning(null)} className="flex-1 py-2 rounded-lg border border-outline-variant text-xs text-on-surface-variant">返回修改</button>
                <button onClick={() => { setConfirmedConflict(true); setConflictWarning(null); doSubmit(); }} className="flex-1 py-2 rounded-lg bg-amber text-white text-xs font-medium">仍然保存</button>
              </div>
            </div>
          )}
          {step !== "choose" && !conflictWarning && (
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("choose")} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant">返回</button>
              <button onClick={handleSubmit} disabled={submitting || (step === "consultation" && !selectedClientId)} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40">
                {submitting ? "保存中..." : "保存"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

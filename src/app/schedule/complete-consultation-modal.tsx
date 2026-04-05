"use client";

import { useState } from "react";
import { ScheduleItem } from "@/hooks/useSchedule";
import { TagInput } from "@/components/tag-input";

type ConsultationRecord = {
  focus: string; note: string; reflection: string; tags: string[];
  subjective?: string; objective?: string; assessment?: string; plan?: string;
};

interface Props {
  item: ScheduleItem;
  allTags: string[];
  useSoap?: boolean;
  onClose: () => void;
  onSubmit: (sessionId: string, updates: ConsultationRecord) => Promise<boolean>;
}

const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";
const textareaClass = inputClass + " resize-none";

const SOAP_FIELDS: { key: keyof ConsultationRecord; label: string; letter: string; placeholder: string; rows: number }[] = [
  { key: "subjective", label: "主诉（S）", letter: "S", placeholder: "来访者自述的问题、感受、主诉...", rows: 3 },
  { key: "objective", label: "观察（O）", letter: "O", placeholder: "咨询师观察到的情绪状态、行为表现...", rows: 3 },
  { key: "assessment", label: "评估（A）", letter: "A", placeholder: "临床评估、概念化、进展分析...", rows: 3 },
  { key: "plan", label: "计划（P）", letter: "P", placeholder: "下次咨询方向、布置作业、行动计划...", rows: 2 },
];

export function CompleteConsultationModal({ item, allTags, useSoap = false, onClose, onSubmit }: Props) {
  // Legacy fields
  const [focus, setFocus] = useState(item.focus ?? "");
  const [note, setNote] = useState(item.note ?? "");
  const [reflection, setReflection] = useState(item.reflection ?? "");
  const [tags, setTags] = useState<string[]>(item.tags ?? []);

  // SOAP fields
  const [subjective, setSubjective] = useState(item.subjective ?? "");
  const [objective, setObjective] = useState(item.objective ?? "");
  const [assessment, setAssessment] = useState(item.assessment ?? "");
  const [plan, setPlan] = useState(item.plan ?? "");

  const [submitting, setSubmitting] = useState(false);

  const soapSetters: Record<string, (v: string) => void> = {
    subjective: setSubjective,
    objective: setObjective,
    assessment: setAssessment,
    plan: setPlan,
  };
  const soapValues: Record<string, string> = { subjective, objective, assessment, plan };

  const handleSubmit = async () => {
    setSubmitting(true);
    const record: ConsultationRecord = useSoap
      ? { focus: "", note: "", reflection: "", tags, subjective, objective, assessment, plan }
      : { focus, note, reflection, tags };
    const ok = await onSubmit(item.id, record);
    setSubmitting(false);
    if (ok) onClose();
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
          {useSoap ? (
            <>
              {SOAP_FIELDS.map(({ key, label, letter, placeholder, rows }) => (
                <div key={key}>
                  <label className="text-xs text-on-surface-variant font-medium block mb-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold mr-1.5">{letter}</span>
                    {label}
                  </label>
                  <textarea
                    value={soapValues[key] as string}
                    onChange={(e) => soapSetters[key](e.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className={textareaClass}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-on-surface-variant font-medium block mb-1.5">焦点</label>
                <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="本次咨询焦点" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant font-medium block mb-1.5">笔记</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="咨询笔记" className={textareaClass} />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant font-medium block mb-1.5">反思</label>
                <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} placeholder="咨询后反思" className={textareaClass} />
              </div>
            </>
          )}
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1.5">标签</label>
            <TagInput tags={tags} allTags={allTags} onChange={setTags} />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface-variant">取消</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 transition-colors">
              {submitting ? "保存中..." : "保存记录"}
            </button>
          </div>
          <button
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(item.id, { focus: "", note: "", reflection: "", tags: [] });
              setSubmitting(false);
              onClose();
            }}
            disabled={submitting}
            className="w-full py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors text-center">
            仅标记完成，稍后补填记录
          </button>
        </div>
      </div>
    </div>
  );
}

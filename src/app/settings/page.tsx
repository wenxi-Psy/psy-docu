"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

const DURATION_OPTIONS = [45, 50, 60, 90];

const cardClass = "bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 space-y-5";
const labelClass = "text-xs text-on-surface-variant font-medium";
const inputClass = "w-full rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors";

export default function SettingsPage() {
  const { profile, loading, updateProfile } = useProfile();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [defaultDuration, setDefaultDuration] = useState(50);
  const [useSoap, setUseSoap] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setDefaultDuration(profile.defaultDuration);
      setUseSoap(profile.useSoap);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateProfile({ displayName, defaultDuration, useSoap });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-on-surface-variant text-sm">加载中...</div></div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-8 space-y-6">
        <h1 className="text-xl font-bold text-on-surface tracking-tight">设置</h1>

        {/* Personal info */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-on-surface">个人信息</h2>
          <div>
            <label className={labelClass + " block mb-1.5"}>显示名称</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="你的名字"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass + " block mb-1.5"}>邮箱</label>
            <div className="px-4 py-3 rounded-2xl bg-surface-container-low text-sm text-on-surface-variant border border-outline-variant/50">
              {user?.email ?? "—"}
            </div>
          </div>
        </div>

        {/* Session defaults */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-on-surface">咨询默认值</h2>
          <div>
            <label className={labelClass + " block mb-2"}>默认咨询时长</label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDefaultDuration(d)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                    defaultDuration === d
                      ? "bg-primary text-white"
                      : "bg-surface-container-low text-on-surface-variant border border-outline-variant hover:bg-surface-container-lowest"
                  }`}
                >
                  {d}分
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Record format */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-on-surface">记录格式</h2>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm text-on-surface font-medium mb-1">SOAP 记录模式</div>
              <div className="text-xs text-on-surface-variant leading-relaxed">
                开启后，完成咨询时使用标准 SOAP 格式（主诉 · 观察 · 评估 · 计划），代替原有的焦点/笔记/反思格式。
              </div>
              {useSoap && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {["S 主诉", "O 观察", "A 评估", "P 计划"].map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setUseSoap(!useSoap)}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${useSoap ? "bg-primary" : "bg-outline-variant"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${useSoap ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          {saving ? "保存中..." : saved ? "已保存 ✓" : "保存设置"}
        </button>
    </div>
  );
}

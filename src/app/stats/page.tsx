"use client";

import { useState } from "react";
import { useStatistics } from "@/hooks/useStatistics";

function formatHours(minutes: number) {
  if (minutes === 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${m}m` : `${h}h`;
}

function OverviewCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5">
      <div className="text-2xl font-bold text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant mt-1">{label}</div>
      {sub && <div className="text-[11px] text-on-surface-variant/60 mt-0.5">{sub}</div>}
    </div>
  );
}

function MonthPicker({ months, currentIndex, onChange }: { months: { label: string }[]; currentIndex: number; onChange: (i: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(0, currentIndex - 1))} disabled={currentIndex <= 0} className="p-1.5 rounded-xl hover:bg-surface-container-low disabled:opacity-30 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <span className="text-sm font-medium text-on-surface min-w-[100px] text-center">{months[currentIndex]?.label}</span>
      <button onClick={() => onChange(Math.min(months.length - 1, currentIndex + 1))} disabled={currentIndex >= months.length - 1} className="p-1.5 rounded-xl hover:bg-surface-container-low disabled:opacity-30 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}

function TrendChart({ data }: { data: { label: string; count: number; supervisionCount: number }[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.count, d.supervisionCount)), 1);
  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
      <h3 className="text-sm font-semibold text-on-surface mb-6">近 6 个月工作量</h3>
      <div className="flex items-end justify-between gap-4 h-40">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex gap-1 items-end h-32 w-full justify-center">
              <div className="w-5 bg-primary-container rounded-t" style={{ height: `${(d.count / maxVal) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px" }}>
                <div className="text-[10px] text-on-surface-variant text-center -mt-4">{d.count || ""}</div>
              </div>
              <div className="w-5 bg-tertiary-container rounded-t" style={{ height: `${(d.supervisionCount / maxVal) * 100}%`, minHeight: d.supervisionCount > 0 ? "8px" : "2px" }}>
                <div className="text-[10px] text-on-surface-variant text-center -mt-4">{d.supervisionCount || ""}</div>
              </div>
            </div>
            <span className="text-xs text-on-surface-variant">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary-container" /><span className="text-xs text-on-surface-variant">咨询</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-tertiary-container" /><span className="text-xs text-on-surface-variant">督导</span></div>
      </div>
    </div>
  );
}

function StatusBar({ active, paused, ended }: { active: number; paused: number; ended: number }) {
  const total = active + paused + ended;
  if (total === 0) return null;
  const segments = [
    { label: "在谈", count: active, color: "bg-primary", emoji: "🌱" },
    { label: "暂停", count: paused, color: "bg-amber", emoji: "🌙" },
    { label: "已结束", count: ended, color: "bg-surface-dim", emoji: "🍂" },
  ].filter((s) => s.count > 0);

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 space-y-4">
      <h3 className="text-sm font-semibold text-on-surface">个案分布</h3>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {segments.map((s) => <div key={s.label} className={`${s.color} rounded-full`} style={{ width: `${(s.count / total) * 100}%` }} />)}
      </div>
      <div className="flex gap-6">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-sm">{s.emoji}</span>
            <span className="text-sm text-on-surface-variant">{s.label}</span>
            <span className="text-sm font-semibold text-on-surface">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { stats, loading, error, refetch } = useStatistics();
  const [monthIndex, setMonthIndex] = useState<number | null>(null);

  const currentIndex = monthIndex ?? (stats ? stats.availableMonths.length - 1 : 0);
  const selectedMonth = stats?.availableMonths[currentIndex];

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-on-surface-variant text-sm">加载中...</div></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-full gap-3"><div className="text-sm text-on-surface-variant">{error}</div><button onClick={refetch} className="text-sm text-primary hover:text-primary-hover transition-colors">重试</button></div>;
  if (!stats) return <div className="flex items-center justify-center h-full"><div className="text-on-surface-variant text-sm">数据加载失败</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface tracking-tight">数据统计</h1>
        <MonthPicker months={stats.availableMonths} currentIndex={currentIndex} onChange={setMonthIndex} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard label={`${selectedMonth?.label.replace(/^\d+年/, "")}咨询`} value={selectedMonth?.sessions ?? 0} sub={formatHours(selectedMonth?.minutes ?? 0)} />
        <OverviewCard label={`${selectedMonth?.label.replace(/^\d+年/, "")}督导`} value={selectedMonth?.supervisions ?? 0} sub={formatHours(selectedMonth?.supervisionMinutes ?? 0)} />
        <OverviewCard label="在谈个案" value={stats.activeClients} />
        <OverviewCard label="累计咨询" value={stats.totalSessions} sub={`共 ${formatHours(stats.totalMinutes)}`} />
      </div>

      <TrendChart data={stats.monthlyTrend} />
      <StatusBar active={stats.activeClients} paused={stats.pausedClients} ended={stats.endedClients} />
    </div>
  );
}

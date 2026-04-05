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

function AreaChart({ data }: { data: { label: string; count: number; supervisionCount: number }[] }) {
  const W = 560;
  const H = 160;
  const paddingX = 24;
  const paddingTop = 24;
  const paddingBottom = 28;
  const chartW = W - paddingX * 2;
  const chartH = H - paddingTop - paddingBottom;
  const maxVal = Math.max(...data.map((d) => Math.max(d.count, d.supervisionCount)), 1);
  const n = data.length;

  const xOf = (i: number) => paddingX + (i / (n - 1)) * chartW;
  const yOf = (v: number) => paddingTop + chartH - (v / maxVal) * chartH;

  // Smooth cubic bezier path
  const smoothPath = (pts: [number, number][]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  };

  const consultPts = data.map((d, i): [number, number] => [xOf(i), yOf(d.count)]);
  const superPts = data.map((d, i): [number, number] => [xOf(i), yOf(d.supervisionCount)]);

  const areaPath = (pts: [number, number][]) => {
    const line = smoothPath(pts);
    const bottom = paddingTop + chartH;
    return `${line} L ${pts[pts.length - 1][0]} ${bottom} L ${pts[0][0]} ${bottom} Z`;
  };

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
      <h3 className="text-sm font-semibold text-on-surface mb-4">近 6 个月工作量</h3>
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradConsult" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5C7A64" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#5C7A64" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradSuper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#625C6C" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#625C6C" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <line key={r}
              x1={paddingX} y1={paddingTop + chartH * (1 - r)}
              x2={W - paddingX} y2={paddingTop + chartH * (1 - r)}
              stroke="rgba(180,182,180,0.15)" strokeWidth="1" />
          ))}

          {/* Supervision area + line */}
          <path d={areaPath(superPts)} fill="url(#gradSuper)" />
          <path d={smoothPath(superPts)} fill="none" stroke="#8B7FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Consultation area + line */}
          <path d={areaPath(consultPts)} fill="url(#gradConsult)" />
          <path d={smoothPath(consultPts)} fill="none" stroke="#5C7A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data point dots + labels */}
          {consultPts.map(([x, y], i) => (
            <g key={`c${i}`}>
              {data[i].count > 0 && <>
                <circle cx={x} cy={y} r="3.5" fill="#5C7A64" />
                <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#626664" fontFamily="Inter,system-ui,sans-serif">{data[i].count}</text>
              </>}
            </g>
          ))}
          {superPts.map(([x, y], i) => (
            <g key={`s${i}`}>
              {data[i].supervisionCount > 0 && <>
                <circle cx={x} cy={y} r="3" fill="#8B7FA8" />
                <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#626664" fontFamily="Inter,system-ui,sans-serif">{data[i].supervisionCount}</text>
              </>}
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text key={`l${i}`} x={xOf(i)} y={H - 4} textAnchor="middle" fontSize="11" fill="#9a9c9a" fontFamily="Inter,system-ui,sans-serif">{d.label}</text>
          ))}
        </svg>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded-full bg-[#5C7A64]" />
          <span className="text-xs text-on-surface-variant">咨询</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded-full bg-[#8B7FA8]" />
          <span className="text-xs text-on-surface-variant">督导</span>
        </div>
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
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
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

      <AreaChart data={stats.monthlyTrend} />
      <StatusBar active={stats.activeClients} paused={stats.pausedClients} ended={stats.endedClients} />
    </div>
  );
}

"use client";

interface StatsCardProps {
  totalSessions: number;
  totalSupervisions: number;
  days: number;
}

export function StatsCard({ totalSessions, totalSupervisions, days }: StatsCardProps) {
  return (
    <div className="bg-primary-container/30 rounded-2xl p-4 space-y-2">
      <div className="flex gap-6">
        <div>
          <div className="text-2xl font-bold text-primary">{totalSessions}</div>
          <div className="text-xs text-primary/70">累计咨询</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{totalSupervisions}</div>
          <div className="text-xs text-primary/70">累计督导</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{days}</div>
          <div className="text-xs text-primary/70">持续天数</div>
        </div>
      </div>
    </div>
  );
}

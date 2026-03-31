"use client";

import { Client } from "@/types";

const STATUS_MAP = {
  active: { label: "在谈", class: "bg-primary-container/50 text-primary" },
  paused: { label: "暂停", class: "bg-amber-bg text-amber" },
  ended: { label: "已结束", class: "bg-surface-container-low text-on-surface-variant" },
};

interface ClientCardProps {
  client: Client;
  isSelected: boolean;
  onClick: () => void;
}

export function ClientCard({ client, isSelected, onClick }: ClientCardProps) {
  const status = STATUS_MAP[client.status];
  return (
    <button onClick={onClick}
      className={`w-full text-left p-3 rounded-2xl transition-colors mb-1 ${isSelected ? "bg-primary-container/30" : "hover:bg-surface-container-lowest/60"}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm text-on-surface">{client.alias}</div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.class}`}>{status.label}</span>
      </div>
      <div className="text-xs text-on-surface-variant mt-1">{client.totalSessions} 次咨询 · {client.days} 天</div>
    </button>
  );
}

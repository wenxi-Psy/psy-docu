"use client";

import { Client } from "@/types";

const STATUS_MAP = {
  active: { label: "在谈", class: "bg-green-50 text-green-700" },
  paused: { label: "暂停", class: "bg-amber-50 text-amber-700" },
  ended: { label: "已结束", class: "bg-gray-100 text-gray-500" },
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
      className={`w-full text-left p-3 rounded-xl transition-colors ${isSelected ? "bg-green-50 border border-green-200" : "hover:bg-gray-50 border border-transparent"}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm text-gray-900">{client.alias}</div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.class}`}>{status.label}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">{client.totalSessions} 次咨询 · {client.days} 天</div>
    </button>
  );
}

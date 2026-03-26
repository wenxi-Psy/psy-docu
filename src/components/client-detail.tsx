"use client";

import { useState } from "react";
import { Client, Session } from "@/types";
import { StatsCard } from "./stats-card";
import { SessionTimeline } from "./session-timeline";
import { SessionDetail } from "./session-detail";
import { AddSessionModal } from "./add-session-modal";
import { EditClientModal } from "./edit-client-modal";

const STATUS_MAP = {
  active: { label: "在谈", class: "bg-green-50 text-green-700" },
  paused: { label: "暂停", class: "bg-amber-50 text-amber-700" },
  ended: { label: "已结束", class: "bg-gray-100 text-gray-500" },
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  active: { status: "paused", label: "标记为暂停" },
  paused: { status: "active", label: "恢复咨询" },
  ended: { status: "active", label: "重新开始" },
};

interface ClientDetailProps {
  client: Client;
  allTags: string[];
  onAddSession: (clientId: string, session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[] }, total: number) => Promise<boolean>;
  onUpdateSession: (sessionId: string, updates: Partial<Session> & { startTime?: string }) => Promise<boolean>;
  onUpdateClient: (id: string, updates: { alias?: string; notes?: string; status?: string }) => Promise<boolean>;
  onDeleteTag?: (tag: string) => Promise<boolean>;
}

export function ClientDetail({ client, allTags, onAddSession, onUpdateSession, onUpdateClient, onDeleteTag }: ClientDetailProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  const status = STATUS_MAP[client.status];
  const nextStatus = NEXT_STATUS[client.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{client.alias}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${status.class}`}>{status.label}</span>
            <button onClick={() => setShowEditClient(true)} className="text-gray-400 hover:text-gray-600" title="编辑">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          {client.notes && <p className="text-sm text-gray-500 mt-1">{client.notes}</p>}
        </div>
        <StatsCard totalSessions={client.totalSessions} totalSupervisions={client.totalSupervisions} days={client.days} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowAddSession(true)} className="px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800">
          + 添加咨询记录
        </button>
        {nextStatus && (
          <button onClick={() => onUpdateClient(client.id, { status: nextStatus.status })}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
            {nextStatus.label}
          </button>
        )}
        {client.status !== "ended" && (
          <button onClick={() => onUpdateClient(client.id, { status: "ended" })}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
            结案
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">咨询历程</h3>
          <SessionTimeline sessions={client.sessions} onSelect={setSelectedSession} selectedId={selectedSession?.id} />
        </div>
        {selectedSession && (
          <div className="w-80 flex-shrink-0">
            <SessionDetail session={selectedSession} allTags={allTags} onUpdate={onUpdateSession} onDeleteTag={onDeleteTag} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddSession && (
        <AddSessionModal clientAlias={client.alias} allTags={allTags}
          onClose={() => setShowAddSession(false)}
          onSubmit={(s) => onAddSession(client.id, s, client.totalSessions)}
          onDeleteTag={onDeleteTag} />
      )}
      {showEditClient && (
        <EditClientModal client={client} onClose={() => setShowEditClient(false)} onUpdate={onUpdateClient} />
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Client, Session } from "@/types";
import { StatsCard } from "./stats-card";
import { SessionTimeline } from "./session-timeline";
import { SessionDetail } from "./session-detail";
import { AddSessionModal } from "./add-session-modal";
import { EditClientModal } from "./edit-client-modal";
import { useAppData } from "@/contexts/app-data-context";

const STATUS_MAP = {
  active: { label: "在谈", class: "bg-primary-container/50 text-primary" },
  paused: { label: "暂停", class: "bg-amber-bg text-amber" },
  ended: { label: "已结束", class: "bg-surface-container-low text-on-surface-variant" },
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  active: { status: "paused", label: "标记为暂停" },
  paused: { status: "active", label: "恢复咨询" },
  ended: { status: "active", label: "重新开始" },
};

type Tab = "sessions" | "supervisions";

interface ClientDetailProps {
  client: Client;
  allTags: string[];
  useSoap?: boolean;
  onAddSession: (clientId: string, session: { date: string; startTime: string; duration: number; focus: string; note: string; reflection: string; tags: string[]; status: "completed" | "pending" }, total: number) => Promise<boolean>;
  onUpdateSession: (sessionId: string, updates: Partial<Session> & { startTime?: string }) => Promise<boolean>;
  onUpdateClient: (id: string, updates: { alias?: string; notes?: string; status?: string; color?: string | null }) => Promise<boolean>;
  onDeleteTag?: (tag: string) => Promise<boolean>;
}

export function ClientDetail({ client, allTags, useSoap = false, onAddSession, onUpdateSession, onUpdateClient, onDeleteTag }: ClientDetailProps) {
  const { scheduleItems } = useAppData();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [tab, setTab] = useState<Tab>("sessions");
  const [sessionSearch, setSessionSearch] = useState("");

  const status = STATUS_MAP[client.status];
  const nextStatus = NEXT_STATUS[client.status];

  // Supervision items linked to this client
  const supervisionItems = useMemo(
    () => scheduleItems
      .filter((i) => i.type === "supervision" && i.relatedClients?.some((c) => c.id === client.id))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [scheduleItems, client.id]
  );

  // Filtered sessions by search
  const filteredSessions = useMemo(() => {
    const q = sessionSearch.toLowerCase().trim();
    if (!q) return client.sessions;
    return client.sessions.filter((s) =>
      s.focus?.toLowerCase().includes(q) ||
      s.note?.toLowerCase().includes(q) ||
      s.reflection?.toLowerCase().includes(q) ||
      s.subjective?.toLowerCase().includes(q) ||
      s.objective?.toLowerCase().includes(q) ||
      s.assessment?.toLowerCase().includes(q) ||
      s.plan?.toLowerCase().includes(q) ||
      s.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [client.sessions, sessionSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-on-surface">{client.alias}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${status.class}`}>{status.label}</span>
            <button onClick={() => setShowEditClient(true)} className="text-on-surface-variant hover:text-on-surface transition-colors" title="编辑">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          {client.notes && <p className="text-sm text-on-surface-variant mt-1">{client.notes}</p>}
        </div>
        <StatsCard totalSessions={client.totalSessions} totalSupervisions={client.totalSupervisions} days={client.days} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowAddSession(true)} className="px-4 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
          + 补录咨询记录
        </button>
        {nextStatus && (
          <button onClick={() => onUpdateClient(client.id, { status: nextStatus.status })}
            className="px-4 py-2.5 rounded-full border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
            {nextStatus.label}
          </button>
        )}
        {client.status !== "ended" && (
          <button onClick={() => onUpdateClient(client.id, { status: "ended" })}
            className="px-4 py-2.5 rounded-full border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
            结案
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container-low rounded-2xl p-1 w-fit gap-0.5">
        <button onClick={() => setTab("sessions")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${tab === "sessions" ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>
          咨询历程 {client.sessions.length > 0 && <span className="ml-1 text-xs opacity-60">{client.sessions.length}</span>}
        </button>
        <button onClick={() => setTab("supervisions")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${tab === "supervisions" ? "bg-white shadow-sm text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>
          督导记录 {supervisionItems.length > 0 && <span className="ml-1 text-xs opacity-60">{supervisionItems.length}</span>}
        </button>
      </div>

      {/* Content */}
      {tab === "sessions" && (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {/* Session search */}
            {client.sessions.length > 2 && (
              <div className="relative mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={sessionSearch}
                  onChange={(e) => { setSessionSearch(e.target.value); setSelectedSession(null); }}
                  placeholder="搜索焦点、笔记、标签..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
            )}
            {sessionSearch && filteredSessions.length === 0 && (
              <p className="text-sm text-on-surface-variant py-4 text-center">无匹配记录</p>
            )}
            <SessionTimeline sessions={filteredSessions} onSelect={setSelectedSession} selectedId={selectedSession?.id} />
          </div>
          {selectedSession && (
            <div className="w-80 flex-shrink-0">
              <SessionDetail session={selectedSession} allTags={allTags} useSoap={useSoap} onUpdate={onUpdateSession} onDeleteTag={onDeleteTag} />
            </div>
          )}
        </div>
      )}

      {tab === "supervisions" && (
        <div className="space-y-3">
          {supervisionItems.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4">暂无与该个案相关的督导记录</p>
          ) : (
            supervisionItems.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest rounded-2xl p-4 space-y-2 shadow-ambient">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-on-surface">{item.title}</span>
                    {item.status === "completed" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-container/50 text-primary font-medium">已完成</span>
                    )}
                    {item.status === "pending" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">待进行</span>
                    )}
                    {item.status === "cancelled" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-medium">已取消</span>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">{item.date}</span>
                </div>
                <div className="text-xs text-on-surface-variant">{item.startTime} · {item.duration} 分钟</div>
                {item.note && (
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{item.note}</p>
                )}
                {item.relatedClients && item.relatedClients.filter((c) => c.id !== client.id).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-xs text-on-surface-variant">同期个案：</span>
                    {item.relatedClients.filter((c) => c.id !== client.id).map((c) => (
                      <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container">{c.alias}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

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

"use client";

import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { ClientCard } from "@/components/client-card";
import { ClientDetail } from "@/components/client-detail";
import { AddClientModal } from "@/components/add-client-modal";

export default function HomePage() {
  const { clients, loading, allTags, addClient, updateClient, addSession, updateSession, deleteTag } = useClients();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredClients = statusFilter === "all" ? clients : clients.filter((c) => c.status === statusFilter);
  const selectedClient = clients.find((c) => c.id === selectedId);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-on-surface-variant text-sm">加载中...</div></div>;
  }

  return (
    <div className="flex h-full">
      {/* Client List */}
      <div className="w-72 bg-surface-container-low flex flex-col">
        <div className="p-5 flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface tracking-tight">个案管理</h2>
          <button onClick={() => setShowAddClient(true)} className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors" title="新建个案">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
        <div className="px-4 pb-2 flex gap-1">
          {[{ key: "all", label: "全部" }, { key: "active", label: "在谈" }, { key: "paused", label: "暂停" }, { key: "ended", label: "已结束" }].map((f) => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${statusFilter === f.key ? "bg-primary-container/50 text-primary font-medium" : "text-on-surface-variant hover:text-on-surface"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} isSelected={selectedId === client.id} onClick={() => setSelectedId(client.id)} />
          ))}
          {filteredClients.length === 0 && <p className="text-xs text-on-surface-variant text-center py-8">暂无个案</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {selectedClient ? (
          <ClientDetail client={selectedClient} allTags={allTags}
            onAddSession={addSession} onUpdateSession={updateSession} onUpdateClient={updateClient} onDeleteTag={deleteTag} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
            <p className="text-sm">选择一个个案查看详情</p>
          </div>
        )}
      </div>

      {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} onSubmit={addClient} />}
    </div>
  );
}

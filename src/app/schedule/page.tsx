"use client";

import { useState, useMemo } from "react";
import { useSchedule, ScheduleItem } from "@/hooks/useSchedule";
import { useClients } from "@/hooks/useClients";
import { AddEventModal } from "@/components/add-event-modal";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(base: Date) {
  const day = base.getDay();
  const mon = new Date(base);
  mon.setDate(base.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}

function endTime(start: string, dur: number) {
  const [h, m] = start.split(":").map(Number);
  const t = h * 60 + m + dur;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

const TYPE = {
  consultation: { label: "咨询", emoji: "🌱", bg: "bg-green-50 border-green-200" },
  supervision: { label: "督导", emoji: "📋", bg: "bg-purple-50 border-purple-200" },
  other: { label: "其他", emoji: "📌", bg: "bg-gray-50 border-gray-200" },
};

function Card({ item, selected, onClick }: { item: ScheduleItem; selected: boolean; onClick: () => void }) {
  const t = TYPE[item.type];
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl p-4 border transition-colors ${selected ? t.bg : "bg-white border-gray-100 hover:border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{t.emoji}</span>
        <span className="text-sm font-semibold text-gray-900">{item.type === "consultation" ? item.clientAlias : item.title}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.label}</span>
        {item.number && <span className="text-xs text-gray-400">第 {item.number} 次</span>}
      </div>
      {item.focus && <p className="text-sm text-gray-500 truncate">{item.focus}</p>}
      {item.relatedClients && item.relatedClients.length > 0 && <p className="text-xs text-gray-400">关联：{item.relatedClients.map((c) => c.alias).join("、")}</p>}
      <div className="text-xs text-gray-400 mt-1">{item.duration} 分钟</div>
    </button>
  );
}

function Detail({ item }: { item: ScheduleItem }) {
  const t = TYPE[item.type];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1"><span>{t.emoji}</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.label}</span></div>
        <h3 className="text-lg font-bold text-gray-900">{item.type === "consultation" ? item.clientAlias : item.title}</h3>
      </div>
      <div className="text-sm text-gray-600">{item.startTime} - {endTime(item.startTime, item.duration)} ({item.duration}分钟)</div>
      {item.focus && <div><div className="text-xs text-gray-400 mb-1">焦点</div><p className="text-sm text-gray-900">{item.focus}</p></div>}
      {item.relatedClients && item.relatedClients.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1">关联个案</div>
          <div className="flex flex-wrap gap-1.5">{item.relatedClients.map((c) => (
            <a key={c.id} href={`/?client=${c.id}`} className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100">{c.alias}</a>
          ))}</div>
        </div>
      )}
      {item.note && <div className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-400 mb-1">备注</div><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.note}</p></div>}
      {item.clientId && <a href={`/?client=${item.clientId}`} className="inline-flex text-sm text-green-700 hover:text-green-800">查看个案详情 →</a>}
    </div>
  );
}

export default function SchedulePage() {
  const { loading, getItemsForDate, datesWithItems, addEvent, refetch } = useSchedule();
  const { clients, addSession } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const dateStr = fmt(selectedDate);
  const dayItems = useMemo(() => getItemsForDate(dateStr), [getItemsForDate, dateStr]);
  const selectedItem = dayItems.find((i) => i.id === selectedItemId);
  const isToday = fmt(new Date()) === dateStr;

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-gray-400 text-sm">加载中...</div></div>;

  return (
    <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 <span className="font-normal text-gray-400">{WEEKDAYS[selectedDate.getDay()]}</span></h1>
          <p className="text-sm text-gray-400 mt-1">{isToday ? `今日有 ${dayItems.length} 项安排` : dayItems.length > 0 ? `${dayItems.length} 项安排` : "无安排"}</p>
        </div>
        {!isToday && <button onClick={() => { setSelectedDate(new Date()); setSelectedItemId(null); }} className="text-xs text-green-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-green-50">回到今天</button>}
      </div>

      {/* Week selector */}
      <div className="flex items-center gap-2">
        <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); setSelectedItemId(null); }} className="p-1.5 rounded-lg hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="flex gap-1">
          {getWeekDays(selectedDate).map((d) => {
            const ds = fmt(d); const sel = dateStr === ds; const today = fmt(new Date()) === ds; const has = datesWithItems.has(ds);
            return (
              <button key={ds} onClick={() => { setSelectedDate(d); setSelectedItemId(null); }}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[48px] ${sel ? "bg-green-700 text-white" : today ? "bg-green-50 text-green-700" : "hover:bg-gray-50 text-gray-700"}`}>
                <span className="text-[10px] font-medium opacity-70">{WEEKDAYS[d.getDay()]}</span>
                <span className="text-sm font-bold">{d.getDate()}</span>
                <div className={`w-1 h-1 rounded-full ${has ? (sel ? "bg-white/70" : "bg-green-500") : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
        <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); setSelectedItemId(null); }} className="p-1.5 rounded-lg hover:bg-gray-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          {dayItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400"><p className="text-sm">这一天没有安排</p></div>
          ) : dayItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 flex-shrink-0 pt-4">
                <div className="text-sm font-medium text-gray-900">{item.startTime}</div>
                <div className="text-[11px] text-gray-400">{endTime(item.startTime, item.duration)}</div>
              </div>
              <div className="flex-1"><Card item={item} selected={selectedItemId === item.id} onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)} /></div>
            </div>
          ))}
        </div>
        {selectedItem && <div className="w-72 flex-shrink-0"><Detail item={selectedItem} /></div>}
      </div>

      <button onClick={() => setShowAdd(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>

      {showAdd && (
        <AddEventModal clients={clients.map((c) => ({ id: c.id, alias: c.alias }))} initialDate={dateStr}
          onClose={() => { setShowAdd(false); refetch(); }}
          onSubmitEvent={addEvent} onSubmitConsultation={addSession}
          getClientTotal={(id) => clients.find((c) => c.id === id)?.totalSessions ?? 0} />
      )}
    </div>
  );
}

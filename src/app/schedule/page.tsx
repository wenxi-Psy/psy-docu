"use client";

import { useState, useMemo } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import { useClients } from "@/hooks/useClients";
import { AddEventModal } from "@/components/add-event-modal";
import { ScheduleControlBar } from "./schedule-control-bar";
import { WeekSelector } from "./week-selector";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { DetailPanel } from "./detail-panel";
import { fmt } from "./utils";

type ViewMode = "day" | "week";

export default function SchedulePage() {
  const { loading, getItemsForDate, datesWithItems, addEvent, refetch } = useSchedule();
  const { clients, addSession } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const dateStr = fmt(selectedDate);
  const dayItems = useMemo(() => getItemsForDate(dateStr), [getItemsForDate, dateStr]);
  const selectedItem = dayItems.find((i) => i.id === selectedItemId);
  const isToday = fmt(new Date()) === dateStr;
  const consultationCount = dayItems.filter((i) => i.type === "consultation").length;

  const handleDateChange = (d: Date) => {
    setSelectedDate(d);
    setSelectedItemId(null);
  };

  const handleWeekChange = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
    setSelectedItemId(null);
  };

  const handleDayClickFromWeek = (d: Date) => {
    setSelectedDate(d);
    setViewMode("day");
    setSelectedItemId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-on-surface-variant text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top section */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4 space-y-4">
        <ScheduleControlBar
          selectedDate={selectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dayItemCount={dayItems.length}
          consultationCount={consultationCount}
          onAddClick={() => setShowAdd(true)}
          onTodayClick={() => handleDateChange(new Date())}
          isToday={isToday}
        />
        <WeekSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onWeekChange={handleWeekChange}
          datesWithItems={datesWithItems}
        />
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden px-8 pb-4">
        {viewMode === "day" ? (
          <DayView
            items={dayItems}
            selectedItemId={selectedItemId}
            onItemClick={(id) => setSelectedItemId(selectedItemId === id ? null : id)}
            isToday={isToday}
          />
        ) : (
          <WeekView
            selectedDate={selectedDate}
            getItemsForDate={getItemsForDate}
            onDayClick={handleDayClickFromWeek}
          />
        )}

        {/* Detail panel (day view only) */}
        {viewMode === "day" && selectedItem && (
          <DetailPanel item={selectedItem} onClose={() => setSelectedItemId(null)} />
        )}
      </div>

      {/* Add event modal */}
      {showAdd && (
        <AddEventModal
          clients={clients.map((c) => ({ id: c.id, alias: c.alias }))}
          initialDate={dateStr}
          onClose={() => { setShowAdd(false); refetch(); }}
          onSubmitEvent={addEvent}
          onSubmitConsultation={addSession}
          getClientTotal={(id) => clients.find((c) => c.id === id)?.totalSessions ?? 0}
        />
      )}
    </div>
  );
}

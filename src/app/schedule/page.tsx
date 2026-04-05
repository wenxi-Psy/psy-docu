"use client";

import { useState, useMemo } from "react";
import { useSchedule, ScheduleItem } from "@/hooks/useSchedule";
import { AddEventModal } from "@/components/add-event-modal";
import { ScheduleControlBar } from "./schedule-control-bar";
import { WeekSelector } from "./week-selector";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { DetailPanel } from "./detail-panel";
import { CompleteConsultationModal } from "./complete-consultation-modal";
import { CompleteSupervisionModal } from "./complete-supervision-modal";
import { CancelModal } from "./cancel-modal";
import { EditScheduleModal } from "./edit-schedule-modal";
import { fmt } from "./utils";
import { useProfile } from "@/hooks/useProfile";

type ViewMode = "day" | "week";
type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit-schedule"; item: ScheduleItem }
  | { type: "complete-consultation"; item: ScheduleItem }
  | { type: "complete-supervision"; item: ScheduleItem }
  | { type: "cancel"; item: ScheduleItem };

export default function SchedulePage() {
  const { loading, error, clients, allTags, addClient, addSession, getItemsForDate, datesWithItems, checkConflict, addEvent, updateSessionSchedule, updateEventSchedule, completeConsultation, completeEvent, cancelItem, revertToPending, refetch } = useSchedule();
  const { profile } = useProfile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

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

  const handleComplete = (item: ScheduleItem) => {
    if (item.type === "consultation") {
      setModal({ type: "complete-consultation", item });
    } else if (item.type === "supervision") {
      setModal({ type: "complete-supervision", item });
    } else {
      // "other" type: complete directly without modal
      completeEvent(item.id);
    }
  };

  const handleCancel = (item: ScheduleItem) => {
    setModal({ type: "cancel", item });
  };

  const handleEditSchedule = (item: ScheduleItem) => {
    setModal({ type: "edit-schedule", item });
  };

  const handleEditRecord = (item: ScheduleItem) => {
    // Re-open the completion modal for editing
    if (item.type === "consultation") {
      setModal({ type: "complete-consultation", item });
    } else if (item.type === "supervision") {
      setModal({ type: "complete-supervision", item });
    }
  };

  const handleEditScheduleSubmit = async (item: ScheduleItem, updates: { date: string; startTime: string; duration: number; title?: string; clientIds?: string[] }) => {
    let ok: boolean;
    if (item.type === "consultation") {
      ok = await updateSessionSchedule(item.id, updates);
    } else {
      ok = await updateEventSchedule(item.id, updates);
    }
    if (ok) setSelectedItemId(null);
    return ok;
  };

  const handleCompleteConsultation = async (sessionId: string, updates: { focus: string; note: string; reflection: string; tags: string[]; subjective?: string; objective?: string; assessment?: string; plan?: string }) => {
    return completeConsultation(sessionId, updates);
  };

  const handleCompleteSupervision = async (eventId: string, note?: string) => {
    return completeEvent(eventId, note);
  };

  const handleCancelItem = async (item: ScheduleItem, reason: string) => {
    return cancelItem(item, reason);
  };

  const handleRevert = async (item: ScheduleItem) => {
    const ok = await revertToPending(item);
    if (ok) setSelectedItemId(null);
    return ok;
  };

  const closeModal = () => setModal({ type: "none" });

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-on-surface-variant text-sm">加载中...</div></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-full gap-3"><div className="text-sm text-on-surface-variant">{error}</div><button onClick={refetch} className="text-sm text-primary hover:text-primary-hover transition-colors">重试</button></div>;

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
          onAddClick={() => setModal({ type: "add" })}
          onTodayClick={() => handleDateChange(new Date())}
          onWeekChange={handleWeekChange}
          isToday={isToday}
        />
        {viewMode === "day" && (
          <WeekSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onWeekChange={handleWeekChange}
            datesWithItems={datesWithItems}
          />
        )}
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
          <DetailPanel
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onEditSchedule={handleEditSchedule}
            onEditRecord={handleEditRecord}
            onRevert={handleRevert}
          />
        )}
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <AddEventModal
          clients={clients.map((c) => ({ id: c.id, alias: c.alias, status: c.status }))}
          initialDate={dateStr}
          onClose={() => { closeModal(); refetch(); }}
          onSubmitEvent={addEvent}
          onSubmitConsultation={addSession}
          getClientTotal={(id) => clients.find((c) => c.id === id)?.totalSessions ?? 0}
          checkConflict={checkConflict}
          onAddClient={(alias, notes) => addClient({ alias, notes: notes ?? "" })}
        />
      )}
      {modal.type === "complete-consultation" && (
        <CompleteConsultationModal
          item={modal.item}
          allTags={allTags}
          useSoap={profile?.useSoap ?? false}
          onClose={closeModal}
          onSubmit={handleCompleteConsultation}
        />
      )}
      {modal.type === "complete-supervision" && (
        <CompleteSupervisionModal
          item={modal.item}
          onClose={closeModal}
          onSubmit={handleCompleteSupervision}
        />
      )}
      {modal.type === "cancel" && (
        <CancelModal
          item={modal.item}
          onClose={closeModal}
          onSubmit={handleCancelItem}
        />
      )}
      {modal.type === "edit-schedule" && (
        <EditScheduleModal
          item={modal.item}
          clients={clients.map((c) => ({ id: c.id, alias: c.alias }))}
          conflictChecker={checkConflict}
          onSubmit={(updates) => handleEditScheduleSubmit(modal.item, updates)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export const TIME_START = 8;
export const TIME_END = 22;
export const HOUR_HEIGHT = 64;
export const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export const TYPE_CONFIG = {
  consultation: { label: "咨询", emoji: "🌱", bg: "bg-primary-container/40", border: "border-primary/20", text: "text-primary" },
  supervision: { label: "督导", emoji: "📋", bg: "bg-secondary-container/60", border: "border-secondary-container", text: "text-[#1e5f8a]" },
  other: { label: "其他", emoji: "📌", bg: "bg-tertiary-container/40", border: "border-tertiary-container", text: "text-tertiary" },
} as const;

/**
 * Predefined color palette for clients.
 * Each color has carefully tuned bg/border/text variants
 * to ensure good readability and contrast on schedule cards.
 */
export interface ClientColorConfig {
  /** Unique key stored in DB */
  key: string;
  /** Display name */
  label: string;
  /** Swatch color for the picker (CSS hex) */
  swatch: string;
  /** Tailwind classes for schedule cards */
  bg: string;
  border: string;
  text: string;
}

export const CLIENT_COLORS: ClientColorConfig[] = [
  { key: "green",  label: "默认绿", swatch: "#4a6550", bg: "bg-primary-container/40",           border: "border-primary/20",           text: "text-primary" },
  { key: "pink",   label: "柔粉",   swatch: "#956b6b", bg: "bg-[#f5e1e1]/60",                   border: "border-[#956b6b]/20",         text: "text-[#7a4f4f]" },
  { key: "sky",    label: "雾蓝",   swatch: "#5a7b8f", bg: "bg-[#dce8ef]/60",                   border: "border-[#5a7b8f]/20",         text: "text-[#3d5f72]" },
  { key: "purple", label: "淡紫",   swatch: "#7d6b8a", bg: "bg-[#ece4f0]/60",                   border: "border-[#7d6b8a]/20",         text: "text-[#5e4d6a]" },
  { key: "amber",  label: "暖橙",   swatch: "#8f7352", bg: "bg-[#f0e6d8]/60",                   border: "border-[#8f7352]/20",         text: "text-[#6d5438]" },
  { key: "terra",  label: "赤陶",   swatch: "#8a6058", bg: "bg-[#f0e0dc]/60",                   border: "border-[#8a6058]/20",         text: "text-[#6b453e]" },
  { key: "indigo", label: "靛蓝",   swatch: "#576b8a", bg: "bg-[#dde3ef]/60",                   border: "border-[#576b8a]/20",         text: "text-[#3e4f6b]" },
  { key: "taupe",  label: "灰棕",   swatch: "#7a7265", bg: "bg-[#eae7e2]/60",                   border: "border-[#7a7265]/20",         text: "text-[#5a5347]" },
];

const colorMap = new Map(CLIENT_COLORS.map((c) => [c.key, c]));

/** Default color config (green, same as current consultation color) */
export const DEFAULT_CLIENT_COLOR = CLIENT_COLORS[0];

/** Get color config by key. Falls back to default green if key is invalid/null. */
export function getClientColor(key: string | null | undefined): ClientColorConfig {
  if (!key) return DEFAULT_CLIENT_COLOR;
  return colorMap.get(key) ?? DEFAULT_CLIENT_COLOR;
}

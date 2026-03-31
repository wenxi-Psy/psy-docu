"use client";

import { CLIENT_COLORS } from "@/lib/client-colors";

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const selected = value ?? CLIENT_COLORS[0].key;

  return (
    <div className="flex flex-wrap gap-2">
      {CLIENT_COLORS.map((c) => (
        <button
          key={c.key}
          type="button"
          title={c.label}
          onClick={() => onChange(c.key)}
          className={`w-7 h-7 rounded-full border-2 transition-all ${
            selected === c.key
              ? "border-on-surface scale-110 shadow-sm"
              : "border-transparent hover:border-outline-variant hover:scale-105"
          }`}
          style={{ backgroundColor: c.swatch }}
        />
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getCurrentTimeY } from "./utils";

export function CurrentTimeIndicator() {
  const [y, setY] = useState<number | null>(getCurrentTimeY());

  useEffect(() => {
    const timer = setInterval(() => setY(getCurrentTimeY()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (y === null) return null;

  return (
    <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: y }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-[#e53935] -ml-1" />
        <div className="flex-1 h-[2px] bg-[#e53935]" />
      </div>
    </div>
  );
}

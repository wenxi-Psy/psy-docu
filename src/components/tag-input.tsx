"use client";

import { useState } from "react";

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
  onDeleteTag?: (tag: string) => Promise<boolean>;
}

export function TagInput({ tags, allTags, onChange, onDeleteTag }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const suggestions = allTags.filter((t) => !tags.includes(t) && (!input || t.includes(input)));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-primary">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(input); } }}
          placeholder="输入标签后回车" className="flex-1 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/30 transition-colors" />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1">
              <button onClick={() => addTag(tag)} className="text-xs px-2 py-1 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
                + {tag}
              </button>
              {onDeleteTag && (
                <button onClick={() => onDeleteTag(tag)} className="text-on-surface-variant/40 hover:text-error-container text-xs">×</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-800">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-green-600">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(input); } }}
          placeholder="输入标签后回车" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-600" />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1">
              <button onClick={() => addTag(tag)} className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-700">
                + {tag}
              </button>
              {onDeleteTag && (
                <button onClick={() => onDeleteTag(tag)} className="text-gray-300 hover:text-red-400 text-xs">×</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

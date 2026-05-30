import React, { useEffect, useMemo, useRef, useState } from "react";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
};

const SearchableSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "",
  className = "",
  inputClassName = "mt-2",
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const sel = options.find((o) => o.value === value);
    setInput(sel ? sel.label : "");
    setQuery("");
  }, [value, options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          const selected = options.find((o) => o.value === value);
          if (selected && input === selected.label) {
            setInput("");
          }
          setQuery("");
          setOpen(true);
        }}
        placeholder={placeholder}
        className={`${inputClassName} w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100`}
        aria-required={required}
      />
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No results</div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setInput(opt.label);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="cursor-pointer px-4 py-3 text-sm text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

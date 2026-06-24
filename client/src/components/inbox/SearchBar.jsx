import { useState, useCallback } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-charcoal)]">
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mail..."
          className="w-full rounded-[10px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] py-2 pl-8 pr-8 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:border-[var(--color-accent-blue)] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}

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
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-charcoal)]">
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mail..."
          className="w-full rounded-[9999px] border border-[var(--color-hairline)] bg-[var(--color-surface-card)] px-4 py-[12px] pl-10 pr-10 text-[17px] leading-[1.47] tracking-[-0.022em] text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}

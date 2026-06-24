const FOLDERS = [
  { key: "inbox", label: "Inbox", icon: "▽" },
  { key: "sent", label: "Sent", icon: "▷" },
  { key: "drafts", label: "Drafts", icon: "✎" },
  { key: "starred", label: "Starred", icon: "☆" },
  { key: "trash", label: "Trash", icon: "✕" },
];

export default function Sidebar({
  activeFolder,
  onFolderChange,
  unreadCounts,
  onCompose,
}) {
  return (
    <aside className="flex w-56 flex-col gap-1 border-r border-[var(--color-hairline)] bg-[var(--color-surface-card)] p-3">
      <button
        type="button"
        onClick={onCompose}
        className="mb-4 flex items-center justify-center gap-2 rounded-[9999px] bg-[var(--color-primary)] px-[22px] py-[11px] text-[17px] leading-none text-[var(--color-primary-on)] transition active:scale-[0.95] hover:opacity-90"
      >
        <span className="text-lg leading-none">+</span>
        Compose
      </button>

      {FOLDERS.map((folder) => {
        const isActive = activeFolder === folder.key;
        const count = unreadCounts?.[folder.key] || 0;

        return (
          <button
            key={folder.key}
            type="button"
            onClick={() => onFolderChange(folder.key)}
            className={`flex items-center justify-between rounded-[8px] px-3 py-2 text-sm transition ${
              isActive
                ? "bg-[var(--color-surface-elevated)] text-[var(--color-ink)]"
                : "text-[var(--color-charcoal)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-ink)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-60">{folder.icon}</span>
              <span>{folder.label}</span>
            </div>
            {count > 0 && folder.key === "inbox" && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-medium text-[var(--color-primary-on)]">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}

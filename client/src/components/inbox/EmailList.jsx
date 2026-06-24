import { useState, useCallback } from "react";
import { updateThread, deleteThread } from "../../api/email";

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSnippet(text, html) {
  if (text) return text.substring(0, 120);
  if (html) return html.replace(/<[^>]*>/g, "").substring(0, 120);
  return "";
}

export default function EmailList({
  threads,
  activeFolder,
  selectedThreadId,
  onSelectThread,
  onThreadsChange,
}) {
  const [loadingThread, setLoadingThread] = useState(null);

  const handleStar = useCallback(
    async (e, threadId, currentStarred) => {
      e.stopPropagation();
      try {
        const result = await updateThread(threadId, {
          isStarred: !currentStarred,
        });
        onThreadsChange((prev) =>
          prev.map((t) =>
            t._id === threadId
              ? { ...t, isStarred: !currentStarred }
              : t
          )
        );
      } catch (err) {
        console.error("Failed to update star:", err);
      }
    },
    [onThreadsChange]
  );

  const handleSelect = useCallback(
    async (threadId) => {
      setLoadingThread(threadId);
      onSelectThread(threadId);
      try {
        if (!threads.find((t) => t._id === threadId)?.isRead) {
          await updateThread(threadId, { isRead: true });
          onThreadsChange((prev) =>
            prev.map((t) =>
              t._id === threadId ? { ...t, isRead: true } : t
            )
          );
        }
      } catch (err) {
        console.error("Failed to mark as read:", err);
      } finally {
        setLoadingThread(null);
      }
    },
    [threads, onSelectThread, onThreadsChange]
  );

  if (!threads || threads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[var(--color-charcoal)]">
          {activeFolder === "inbox"
            ? "No emails yet"
            : activeFolder === "starred"
            ? "No starred emails"
            : activeFolder === "drafts"
            ? "No drafts"
            : activeFolder === "trash"
            ? "Trash is empty"
            : `No emails in ${activeFolder}`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {threads.map((thread) => {
        const isSelected = selectedThreadId === thread._id;
        const msg = thread.latestMessage || {};
        const snippet = getSnippet(msg.text, msg.html);

        let displayFrom = msg.from || "";
        if (displayFrom.includes("<")) {
          const match = displayFrom.match(/^"?([^"<]+)"?\s*</);
          if (match) displayFrom = match[1].trim();
        }
        if (!displayFrom) displayFrom = "Unknown";

        return (
          <button
            key={thread._id}
            type="button"
            onClick={() => handleSelect(thread._id)}
            className={`flex flex-col gap-0.5 border-b border-[var(--color-hairline)] px-5 py-3.5 text-left transition hover:bg-[var(--color-surface-elevated)] ${
              isSelected ? "bg-[var(--color-surface-elevated)]" : ""
            } ${!thread.isRead ? "" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`truncate text-[17px] tracking-[-0.022em] ${
                  !thread.isRead
                    ? "font-semibold text-[var(--color-ink)]"
                    : "text-[var(--color-body)]"
                }`}
              >
                {displayFrom}
              </span>
              <div className="flex items-center gap-2">
                {thread.messageCount > 1 && (
                  <span className="text-xs text-[var(--color-charcoal)]">
                    ({thread.messageCount})
                  </span>
                )}
                <span className="whitespace-nowrap text-xs text-[var(--color-charcoal)]">
                  {formatRelativeTime(thread.lastMessageAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleStar(e, thread._id, thread.isStarred)}
                className={`text-sm transition ${
                  thread.isStarred
                    ? "text-[var(--color-accent-orange)]"
                    : "text-transparent group-hover:text-[var(--color-charcoal)]"
                }`}
              >
                {thread.isStarred ? "★" : "☆"}
              </button>
              <span
                className={`truncate text-sm ${
                  !thread.isRead
                    ? "font-medium text-[var(--color-ink)]"
                    : "text-[var(--color-body)]"
                }`}
              >
                {thread.subject || "(no subject)"}
              </span>
            </div>
            {snippet && (
              <p className="truncate text-sm text-[var(--color-charcoal)]">
                {snippet}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

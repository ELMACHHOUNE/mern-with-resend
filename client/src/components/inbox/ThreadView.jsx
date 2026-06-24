import { useState, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import { getThread, sendEmail, getAttachmentUrl } from "../../api/email";

function formatFullDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

function extractName(email) {
  if (!email) return "Unknown";
  if (email.includes("<")) {
    const match = email.match(/^"?([^"<]+)"?\s*</);
    if (match) return match[1].trim();
    const addr = email.match(/<([^>]+)>/);
    if (addr) return addr[1];
  }
  return email;
}

function extractAddress(email) {
  if (!email) return "";
  const match = email.match(/<([^>]+)>/);
  return match ? match[1] : email;
}

export default function ThreadView({
  threadId,
  onBack,
  activeFolder,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMode, setReplyMode] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);

  useEffect(() => {
    if (!threadId) return;
    setLoading(true);
    setReplyMode(null);
    setReplyText("");
    getThread(threadId)
      .then(setData)
      .catch((err) => console.error("Failed to load thread:", err))
      .finally(() => setLoading(false));
  }, [threadId]);

  const handleReply = useCallback(
    async (message, type) => {
      if (!replyText.trim()) return;
      setSending(true);
      try {
        const subject = message.subject.startsWith("Re:")
          ? message.subject
          : `Re: ${message.subject}`;
        const body =
          type === "reply"
            ? replyText
            : replyText +
              `\n\n--- Forwarded message ---\nFrom: ${message.from}\nSubject: ${message.subject}\n\n${message.text || ""}`;

        const payload = {
          to: [extractAddress(message.from)],
          subject,
          text: body,
          threadId: data.thread._id,
          inReplyTo: message.headers?.messageId || "",
        };

        await sendEmail(payload);
        setReplyMode(null);
        setReplyText("");
        const updated = await getThread(threadId);
        setData(updated);
      } catch (err) {
        console.error("Failed to send reply:", err);
      } finally {
        setSending(false);
      }
    },
    [replyText, threadId, data]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[var(--color-charcoal)]">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[var(--color-charcoal)]">Thread not found</p>
      </div>
    );
  }

  const { thread, messages } = data;
  const latestMsg = messages[messages.length - 1];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-[var(--color-hairline)] px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
        >
          ← Back
        </button>
        <h2 className="flex-1 truncate text-base font-medium text-[var(--color-ink)]">
          {thread.subject || "(no subject)"}
        </h2>
        <span className="text-xs text-[var(--color-charcoal)]">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => {
          const isExpanded = expandedMessage === msg._id || idx === messages.length - 1;
          const sanitizedHtml = msg.html
            ? DOMPurify.sanitize(msg.html)
            : null;

          return (
            <div
              key={msg._id}
              className="border-b border-[var(--color-hairline)] px-4 py-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/20 text-xs font-medium text-[var(--color-accent-blue)]">
                    {extractName(msg.from)[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {extractName(msg.from)}
                    </p>
                    <p className="text-xs text-[var(--color-charcoal)]">
                      to {msg.to?.join(", ") || "me"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-charcoal)]">
                    {formatFullDate(msg.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      isExpanded
                        ? setExpandedMessage(null)
                        : setExpandedMessage(msg._id)
                    }
                    className="text-xs text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3">
                  {sanitizedHtml ? (
                    <div
                      className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--color-body)]"
                      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-body)]">
                      {msg.text || "(no content)"}
                    </p>
                  )}

                  {msg.attachments?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.attachments.map((att, i) => (
                        <a
                          key={att.resendAttachmentId || i}
                          href={getAttachmentUrl(msg._id, att.resendAttachmentId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-[6px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs text-[var(--color-link)] transition hover:bg-[var(--color-surface-card)]"
                        >
                          <span>📎</span>
                          <span className="truncate max-w-[150px]">
                            {att.filename}
                          </span>
                          {att.size > 0 && (
                            <span className="text-[var(--color-charcoal)]">
                              ({Math.round(att.size / 1024)}KB)
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}

                  {activeFolder !== "trash" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyMode(msg._id);
                          setReplyText("");
                        }}
                        className="text-xs text-[var(--color-link)] hover:underline"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyMode(`forward-${msg._id}`);
                          setReplyText("");
                        }}
                        className="text-xs text-[var(--color-link)] hover:underline"
                      >
                        Forward
                      </button>
                    </div>
                  )}

                  {replyMode === msg._id && (
                    <div className="mt-3 rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-elevated)] p-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows={4}
                        className="w-full resize-none rounded-[6px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] p-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:border-[var(--color-accent-blue)] focus:outline-none"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyMode(null)}
                          className="rounded-[6px] px-3 py-1.5 text-xs text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReply(msg, "reply")}
                          disabled={sending || !replyText.trim()}
                          className="rounded-[6px] bg-[var(--color-accent-blue)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          {sending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  )}

                  {replyMode === `forward-${msg._id}` && (
                    <div className="mt-3 rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-elevated)] p-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Add a note before forwarding..."
                        rows={4}
                        className="w-full resize-none rounded-[6px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] p-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:border-[var(--color-accent-blue)] focus:outline-none"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyMode(null)}
                          className="rounded-[6px] px-3 py-1.5 text-xs text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReply(msg, "forward")}
                          disabled={sending}
                          className="rounded-[6px] bg-[var(--color-accent-blue)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          {sending ? "Forwarding..." : "Forward"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { sendEmail, saveDraft } from "../../api/email";

export default function ComposeModal({
  isOpen,
  onClose,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  threadId,
  inReplyTo,
}) {
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [form, setForm] = useState({
    to: initialTo,
    cc: "",
    bcc: "",
    subject: initialSubject,
    body: initialBody,
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }, []);

  const handleSend = useCallback(async () => {
    if (!form.to.trim()) {
      setError("At least one recipient is required");
      return;
    }

    setSending(true);
    setError("");

    try {
      const toList = form.to
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const ccList = form.cc
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const bccList = form.bcc
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const payload = {
        to: toList,
        subject: form.subject || "(no subject)",
        text: form.body,
        ...(ccList.length > 0 && { cc: ccList }),
        ...(bccList.length > 0 && { bcc: bccList }),
        ...(threadId && { threadId }),
        ...(inReplyTo && { inReplyTo }),
      };

      await sendEmail(payload);
      onClose(true);
    } catch (err) {
      setError(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  }, [form, threadId, inReplyTo, onClose]);

  const handleSaveDraft = useCallback(async () => {
    setSending(true);
    setError("");

    try {
      const toList = form.to
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const ccList = form.cc
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const bccList = form.bcc
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      await saveDraft({
        to: toList,
        cc: ccList,
        bcc: bccList,
        subject: form.subject,
        text: form.body,
      });

      onClose(true);
    } catch (err) {
      setError(err.message || "Failed to save draft");
    } finally {
      setSending(false);
    }
  }, [form, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />
      <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-t-[16px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-elevated)] shadow-2xl sm:mb-0 sm:rounded-[16px]">
        <div className="flex items-center justify-between border-b border-[var(--color-hairline)] px-5 py-3">
          <h3 className="text-sm font-medium text-[var(--color-ink)]">
            New Message
          </h3>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="text-sm text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-0">
          <div className="flex items-center border-b border-[var(--color-hairline)] px-4">
            <span className="w-12 text-xs text-[var(--color-charcoal)]">To</span>
            <input
              type="text"
              value={form.to}
              onChange={(e) => updateField("to", e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCc(!showCc)}
                className={`text-xs ${showCc ? "text-[var(--color-accent-blue)]" : "text-[var(--color-charcoal)]"} hover:text-[var(--color-ink)]`}
              >
                Cc
              </button>
              <button
                type="button"
                onClick={() => setShowBcc(!showBcc)}
                className={`text-xs ${showBcc ? "text-[var(--color-accent-blue)]" : "text-[var(--color-charcoal)]"} hover:text-[var(--color-ink)]`}
              >
                Bcc
              </button>
            </div>
          </div>

          {showCc && (
            <div className="flex items-center border-b border-[var(--color-hairline)] px-4">
              <span className="w-12 text-xs text-[var(--color-charcoal)]">Cc</span>
              <input
                type="text"
                value={form.cc}
                onChange={(e) => updateField("cc", e.target.value)}
                placeholder="cc@example.com"
                className="flex-1 bg-transparent py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:outline-none"
              />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center border-b border-[var(--color-hairline)] px-4">
              <span className="w-12 text-xs text-[var(--color-charcoal)]">Bcc</span>
              <input
                type="text"
                value={form.bcc}
                onChange={(e) => updateField("bcc", e.target.value)}
                placeholder="bcc@example.com"
                className="flex-1 bg-transparent py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center border-b border-[var(--color-hairline)] px-4">
            <span className="w-12 text-xs text-[var(--color-charcoal)]">Subj</span>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              placeholder="Subject"
              className="flex-1 bg-transparent py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:outline-none"
            />
          </div>

          <div className="px-4 py-2">
            <textarea
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              placeholder="Write your message..."
              rows={12}
              className="w-full resize-none bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-charcoal)] focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 pb-2">
            <p className="text-xs text-[var(--color-accent-red)]">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--color-hairline)] px-4 py-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={sending}
            className="text-xs text-[var(--color-charcoal)] hover:text-[var(--color-ink)] disabled:opacity-50"
          >
            Save draft
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="rounded-[8px] px-4 py-1.5 text-xs text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="rounded-[8px] bg-[var(--color-accent-blue)] px-5 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

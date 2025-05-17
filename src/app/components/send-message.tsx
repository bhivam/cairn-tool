"use client";

import { useCallback, useState } from "react";

type SendMessageProps = {
  sendMessage(this: void, content: string): Promise<void>;
  isPending: boolean;
};

export default function SendMessage({ sendMessage, isPending }: SendMessageProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);
      if (!content.trim()) return;
      try {
        await sendMessage(content);
        setContent("");
      } catch (_) {
        setError("Failed to send message.");
      }
    },
    [content, sendMessage]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t bg-white px-4 py-2"
      aria-label="Send message"
    >
      <input
        type="text"
        className="flex-1 rounded border px-3 py-2 focus:border-purple-400 focus:outline-none text-black"
        placeholder="Type your message…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        aria-label="Message"
      />
      <button
        type="submit"
        className="rounded bg-purple-500 px-4 py-2 text-white transition hover:bg-purple-600 disabled:opacity-50"
        disabled={isPending || !content.trim()}
      >
        {isPending ? "Sending…" : "Send"}
      </button>
      {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
    </form>
  );
}


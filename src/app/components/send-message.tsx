"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { match } from "ts-pattern";

type SendMessageProps = {
  sendMessage(this: void, content: string): Promise<void>;
  isPending: boolean;
};

export default function SendMessage({
  sendMessage,
  isPending,
}: SendMessageProps) {
  const history = useRef([""]);
  const historyCursor = useRef(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);
      if (!content.trim()) return;
      try {
        setContent("");
        await sendMessage(content);
        history.current[history.current.length - 1] = content;
        history.current.push("");
        historyCursor.current = history.current.length - 1;

        // TODO this is hacky, find a better solution
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 20);
      } catch (_) {
        setError("Failed to send message.");
      }
    },
    [content, sendMessage],
  );

  function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value);
  }

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    match(e)
      .with({ key: "ArrowUp" }, () => {
        if (
          history.current[historyCursor.current] ||
          history.current[historyCursor.current - 1]
        ) {
          e.preventDefault();
          setContent(history.current[historyCursor.current - 1] ?? "");
          historyCursor.current--;
        }
      })
      .with({ key: "ArrowDown" }, () => {
        if (
          history.current[historyCursor.current] ||
          history.current[historyCursor.current + 1]
        ) {
          e.preventDefault();
          setContent(history.current[historyCursor.current + 1] ?? "");
          historyCursor.current++;
        }
      })
      .otherwise(() => {
        return;
      });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-card flex items-center gap-2 border-t px-4 py-2"
      aria-label="Send message"
    >
      <input
        type="text"
        ref={inputRef}
        className="border-input bg-background text-foreground focus:border-primary flex-1 rounded border px-3 py-2 focus:outline-none"
        placeholder="Type your message…"
        value={content}
        onChange={handleMessageChange}
        onKeyUp={handleKeyUp}
        disabled={isPending}
        aria-label="Message"
      />
      <button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-2 transition disabled:opacity-50"
        disabled={isPending || !content.trim()}
      >
        Send
      </button>
      {error && <span className="text-destructive ml-2 text-sm">{error}</span>}
    </form>
  );
}

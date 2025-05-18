"use client";

import { useCallback, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { match } from "ts-pattern";

type SendMessageProps = {
  sendMessage(this: void, content: string): Promise<void>;
  isPending: boolean;
};

export default function SendMessage({ sendMessage, isPending }: SendMessageProps) {
  const history = useRef([""])
  const historyCursor = useRef(0)
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);
      if (!content.trim()) return;
      try {
        setContent("");
        await sendMessage(content);
        history.current[history.current.length - 1] = content
        history.current.push("")
        historyCursor.current = history.current.length - 1;

        // TODO this is hacky, find a better solution
        setTimeout(() => {
          if (inputRef.current)
            inputRef.current.focus()
        }, 20);
      } catch (_) {
        setError("Failed to send message.");
      }
    },
    [content, sendMessage]
  );

  // TODO: style this up

  function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value)
  }

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {



    match(e)
      .with({ key: "ArrowUp" }, () => {
        console.log(history.current)
        console.log(historyCursor.current)
        if (history.current[historyCursor.current - 1]) {
          e.preventDefault()
          setContent(history.current[historyCursor.current - 1]!)
          historyCursor.current--;
        }
      })
      .with({ key: "ArrowDown" }, () => {
        if (history.current[historyCursor.current + 1]) {
          e.preventDefault()
          setContent(history.current[historyCursor.current + 1]!)
          historyCursor.current++;
        }
      })
      .otherwise(() => { })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t bg-white px-4 py-2"
      aria-label="Send message"
    >
      <input
        type="text"
        ref={inputRef}
        className="flex-3/4 rounded border px-3 py-2 focus:border-purple-400 focus:outline-none text-black"
        placeholder="Type your message…"
        value={content}
        onChange={handleMessageChange}
        onKeyUp={handleKeyUp}
        disabled={isPending}
        aria-label="Message"
      />
      <button
        type="submit"
        className="rounded bg-purple-500 px-4 py-2 text-white transition hover:bg-purple-600 disabled:opacity-50"
        disabled={isPending || !content.trim()}
      >
        Send
      </button>
      {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
    </form>
  );
}


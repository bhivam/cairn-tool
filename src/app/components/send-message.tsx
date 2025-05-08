'use client';

import { api } from "@/trpc/react";
import { useState } from "react";

export default function SendMessage() {
  const [content, setContent] = useState("")
  const createMut = api.message.create.useMutation()

  async function handleSendMessage() {
    createMut.mutateAsync({ content })
    setContent("")
  }

  return <input
    type="text"
    className="border rounded-md bg-purple-500"
    onChange={e => setContent(e.target.value)}
    value={content}
    onKeyUp={e => {
      if (e.key !== "Enter") return;
      handleSendMessage()
    }}
  />
}


'use client';

import MessageList from "./message-list";
import SendMessage from "./send-message";
import { api, type RouterOutputs } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function MessageBar() {
  const getMessagesQuery = api.message.getMessages.useQuery();
  const queryClient = useQueryClient();
  const session = useSession();

  const optimisticId = useRef(0);
  const dummyDiv = useRef<HTMLDivElement>(null);

  const createMessageMutation = api.message.create.useMutation({
    onMutate: async ({ content }) => {
      const previous =
        queryClient.getQueryData<RouterOutputs["message"]["getMessages"]>(
          [["message", "getMessages"]]
        );
      const newMessage: RouterOutputs["message"]["getMessages"][number] = {
        id: optimisticId.current++,
        content,
        createdById: session.data!.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      queryClient.setQueryData<RouterOutputs["message"]["getMessages"]>(
        [["message", "getMessages"]],
        (old) => (old ? [...old, newMessage] : [newMessage])
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          [["message", "getMessages"]],
          context.previous
        );
    },
  });

  function scrollToBottom() {
    dummyDiv.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function sendMessage(content: string) {
    if (!session.data?.user) throw new Error("Not logged in");
    await createMessageMutation.mutateAsync({ content });
    scrollToBottom()
  }

  useEffect(
    () => {
      dummyDiv.current?.scrollIntoView({ behavior: "instant" })
    },
    [dummyDiv.current] // NOTE might be dangerous
  )

  return (
    <div className="flex flex-col h-full w-full bg-white shadow-lg">
      <div
        ref={dummyDiv}
        className="flex-1 min-h-0 overflow-y-scroll"
      >
        <MessageList
          isPending={getMessagesQuery.isPending}
          isError={getMessagesQuery.isError}
          messages={getMessagesQuery.data}
          dummyDiv={dummyDiv}
        />
      </div>
      <SendMessage
        sendMessage={sendMessage}
        isPending={createMessageMutation.isPending}
      />
    </div>
  );
}


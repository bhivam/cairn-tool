"use client";

import { createContext, useContext, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { api, type RouterOutputs } from "@/trpc/react";

type MessageSenderContextValue = {
  sendMessage: (content: string) => Promise<void>;
  isPending: boolean;
};

const MessageSenderContext = createContext<MessageSenderContextValue | null>(
  null,
);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const session = useSession();
  const optimisticId = useRef(Math.floor(Math.random() * 1_000_000));

  const createMessageMutation = api.message.create.useMutation({
    onMutate: async ({ content }) => {
      const previous = queryClient.getQueryData<
        RouterOutputs["message"]["getMessages"]
      >([["message", "getMessages"], { type: "query" }]);

      // require logged-in user
      if (!session.data?.user) return { previous };

      const user: RouterOutputs["message"]["getMessages"][number]["user"] = {
        id: session.data.user.id,
        name: session.data.user.name ?? "",
        email: session.data.user.email ?? "",
        emailVerified: null,
        image: session.data.user.image ?? "",
      };

      const newMessage: RouterOutputs["message"]["getMessages"][number] = {
        id: optimisticId.current++,
        content,
        createdById: session.data.user.id,
        user,
        commandResult: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<RouterOutputs["message"]["getMessages"]>(
        [["message", "getMessages"], { type: "query" }],
        (old) => (old ? [...old, newMessage] : [newMessage]),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          [["message", "getMessages"], { type: "query" }],
          context.previous,
        );
    },
  });

  const value = useMemo<MessageSenderContextValue>(() => ({
    sendMessage: async (content: string) => {
      await createMessageMutation.mutateAsync({ content });
    },
    isPending: createMessageMutation.isPending,
  }), [createMessageMutation.isPending]);

  return (
    <MessageSenderContext.Provider value={value}>
      {children}
    </MessageSenderContext.Provider>
  );
}

export function useMessageSender(): MessageSenderContextValue {
  const ctx = useContext(MessageSenderContext);
  if (!ctx) throw new Error("useMessageSender must be used within MessageProvider");
  return ctx;
}


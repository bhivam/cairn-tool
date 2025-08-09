"use client";

import MessageList from "./message-list";
import SendMessage from "./send-message";
import { api, type RouterOutputs } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, useCallback } from "react";

export default function MessageBar() {
  const getMessagesQuery = api.message.getMessages.useQuery();
  const queryClient = useQueryClient();
  const session = useSession();

  const optimisticId = useRef(Math.floor(Math.random() * 1000000));
  const dummyDiv = useRef<HTMLDivElement>(null);
  const scrollableDiv = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showGoToCurrent, setShowGoToCurrent] = useState(false);

  const createMessageMutation = api.message.create.useMutation({
    onMutate: async ({ content }) => {
      const previous = queryClient.getQueryData<
        RouterOutputs["message"]["getMessages"]
      >([["message", "getMessages"], { type: "query" }]);

      const user: RouterOutputs["message"]["getMessages"][number]["user"] = {
        id: session.data!.user.id,
        name: session.data!.user.name ?? "",
        email: session.data!.user.email ?? "",
        emailVerified: null,
        image: session.data!.user.image ?? "",
      };

      const newMessage: RouterOutputs["message"]["getMessages"][number] = {
        id: optimisticId.current++,
        content,
        createdById: session.data!.user.id,
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

  // TODO some sort of error handling for broken connections
  api.message.messageUpdates.useSubscription(undefined, {
    onData: (message) => {
      if (message.createdById !== session.data!.user.id) {
        queryClient.setQueryData<RouterOutputs["message"]["getMessages"]>(
          [["message", "getMessages"], { type: "query" }],
          (old) => (old ? [...old, message] : [message]),
        );
        if (!isAtBottom) setShowGoToCurrent(true);
      } else {
        queryClient.setQueryData<RouterOutputs["message"]["getMessages"]>(
          [["message", "getMessages"], { type: "query" }],
          (old) =>
            old ? [...old.slice(0, old.length - 1), message] : [message],
        );
      }
    },
  });

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    dummyDiv.current?.scrollIntoView({ behavior });
  }

  async function sendMessage(content: string) {
    if (!session.data?.user) throw new Error("Not logged in");
    await createMessageMutation.mutateAsync({ content });
    scrollToBottom();
  }

  const handleScroll = useCallback(() => {
    const el = scrollableDiv.current;
    if (!el) return;

    const threshold = 40;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setShowGoToCurrent(false);
  }, []);

  useEffect(() => {
    const el = scrollableDiv.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!getMessagesQuery.data) return;
    if (isAtBottom) scrollToBottom("instant");
  }, [getMessagesQuery.data ? getMessagesQuery.data.length : 0]);

  useEffect(() => {
    if (!getMessagesQuery.data) return;
    if (isAtBottom) scrollToBottom("instant");
  }, [
    getMessagesQuery.data
      ? getMessagesQuery.data[getMessagesQuery.data.length - 1]
      : null,
  ]);

  function handleGoToCurrent() {
    scrollToBottom("smooth");
    setShowGoToCurrent(false);
  }


  return (
    <>
      {/* Removed in favor of floating overlay */}
      <div
        ref={scrollableDiv}
        className="relative min-h-0 flex-1 overflow-y-scroll"
        style={{ position: "relative" }}
      >
        <MessageList
          isPending={getMessagesQuery.isPending}
          isError={getMessagesQuery.isError}
          messages={getMessagesQuery.data}
          dummyDiv={dummyDiv}
        />
        <div ref={dummyDiv} />
        {showGoToCurrent && (
          <div
            style={{
              position: "sticky",
              bottom: "1rem",
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <button
              onClick={handleGoToCurrent}
              className="bg-primary text-primary-foreground hover:bg-primary/80 rounded px-4 py-2 shadow transition"
              style={{
                pointerEvents: "auto",
              }}
            >
              Go to current
            </button>
          </div>
        )}
      </div>
      <SendMessage
        sendMessage={sendMessage}
        isPending={createMessageMutation.isPending}
      />
    </>
  );
}

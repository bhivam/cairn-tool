import Link from "next/link";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import SendMessage from "./components/send-message";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <>Error</>
  }
  const messages = await api.message.getMessages();

  return (
    <HydrateClient>
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex items-center justify-between gap-12 px-[5vw] py-[2vh]">
          <div className="flex items-end gap-4">
            <h1 className="text-5xl font-extrabold">
              Cairn1
            </h1>
            <p>A work in progress...</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-center text-2xl text-white">
              {session && <span>Hello {session.user?.name}</span>}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>

        <div>
          {messages.map(message => <p>{message.content}</p>)}
          <SendMessage />
        </div>

      </main>
    </HydrateClient>
  );
}

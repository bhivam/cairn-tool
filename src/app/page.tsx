import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import MessageBar from "./components/message-bar";
import Canvas from "./components/canvas";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex flex-col h-screen text-white">
        <div
          className="flex items-center justify-between gap-12 px-[1vw] py-[2vh] bg-gradient-to-b from-[#2e026d] to-[#15162c]"
        >
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
        {
          session ?
            <div className="flex h-full overflow-y-auto">
              <div className="basis-3/4 flex-auto">
                <Canvas />
              </div>
              <div className="basis-1/4 flex-auto">
                <MessageBar />
              </div>
            </div> :
            null
        }
      </main>
    </HydrateClient>
  );
}

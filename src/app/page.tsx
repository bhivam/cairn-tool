import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import MessageBar from "./components/message-bar";
import InteractiveMap from "./components/interactive-map";
import CharacterSheet from "./components/character-sheet";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex h-screen flex-col text-white">
        <div className="flex items-center justify-between gap-12 bg-gradient-to-b from-[#2e026d] to-[#15162c] px-[1vw] py-[2vh]">
          <div className="flex items-end gap-4">
            <h1 className="text-5xl font-extrabold">Stele</h1>
          </div>
          <div></div>
          <div className="flex items-center gap-2">
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
        {session ? (
          <div className="flex h-full overflow-y-auto">
            <div className="flex-auto basis-1/5">
              <CharacterSheet />
            </div>
            <div className="flex-auto basis-3/5 border-1 border-r-black border-l-black">
              <InteractiveMap />
            </div>
            <div className="flex-auto basis-1/5">
              <MessageBar />
            </div>
          </div>
        ) : null}
      </main>
    </HydrateClient>
  );
}

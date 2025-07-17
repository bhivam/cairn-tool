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
      <main className="bg-background text-foreground flex h-screen flex-col">
        <div className="bg-primary border-border flex items-center justify-between gap-12 border-b px-[1vw] py-2">
          <div className="flex items-end gap-4">
            <h1 className="text-primary-foreground text-5xl font-extrabold drop-shadow">
              Stele
            </h1>
          </div>
          <div></div>
          <div className="flex items-center gap-2">
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="bg-primary/10 hover:bg-primary/20 text-primary-foreground border-primary rounded-full border px-10 py-3 font-semibold no-underline transition"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
        {session ? (
          <div className="bg-background flex h-full overflow-y-auto">
            <div className="border-border bg-card flex-auto basis-1/5 border-r">
              <CharacterSheet />
            </div>
            <div className="border-border bg-surface flex-auto basis-3/5 border-x">
              <InteractiveMap />
            </div>
            <div className="border-border bg-card flex-auto basis-1/5 border-l">
              <MessageBar />
            </div>
          </div>
        ) : null}
      </main>
    </HydrateClient>
  );
}

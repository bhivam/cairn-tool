import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import MessageBar from "./components/message-bar";
import InteractiveMap from "./components/interactive-map";
import { AppSidebar } from "./components/app-sidebar";
import { Header } from "./components/header";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      {session ? (
        <>
          <main className="bg-background text-foreground flex h-screen w-full flex-col">
            <div className="absolute z-10 flex">
              <AppSidebar />
            </div>
            <div className="bg-background flex h-full overflow-y-auto">
              <div className="border-border bg-surface basis-3/4 border-x">
                <InteractiveMap />
              </div>
              <div className="border-border bg-card basis-1/4 flex-col border-l">
                <div className="bg-card text-foreground border-border flex h-full w-full flex-col border-l-2">
                  <Header />
                  <MessageBar />
                </div>
              </div>
            </div>
          </main>
        </>
      ) : null}
    </HydrateClient>
  );
}

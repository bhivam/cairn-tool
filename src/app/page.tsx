import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import Link from "next/link";
import MessageBar from "./components/message-bar";
import InteractiveMap from "./components/interactive-map";
import { AppSidebar } from "./components/app-sidebar";
import { Header } from "./components/header";
import { MapSettingsProvider } from "./providers/map-settings";
import MapControlsOverlay from "./components/map-controls-overlay";

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
              <MapSettingsProvider>
                <div className="relative border-border bg-surface basis-3/4 border-x">
                  <InteractiveMap />
                  <MapControlsOverlay />
                </div>
                <div className="border-border bg-card basis-1/4 flex-col border-l">
                  <div className="bg-card text-foreground border-border flex h-full w-full flex-col border-l-2">
                    <Header />
                    <MessageBar />
                  </div>
                </div>
              </MapSettingsProvider>
            </div>
          </main>
        </>
      ) : (
        <main className="bg-background text-foreground flex h-screen w-full items-center justify-center">
          <Link
            href="/api/auth/signin"
            className="bg- hover:bg-primary/20 text-secondary-foreground border-border border-2 px-10 py-3 font-semibold no-underline transition"
          >
            Sign in
          </Link>
        </main>
      )}
    </HydrateClient>
  );
}

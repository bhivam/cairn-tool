import Link from "next/link";
import { auth } from "@/server/auth";

export async function Header() {
  const session = await auth();

  return (
    <div className="border-border flex items-center justify-between gap-12 border-b-2 px-[1vw] py-2">
      <div className="flex items-end gap-4">
        <h1 className="text-secondary-foreground text-5xl font-extrabold drop-shadow">
          Stele
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className="bg- hover:bg-primary/20 text-secondary-foreground border-border border-2 px-10 py-3 font-semibold no-underline transition"
        >
          {session ? "Sign out" : "Sign in"}
        </Link>
      </div>
    </div>
  );
}

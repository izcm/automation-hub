import Link from "next/link";
import { TAB } from "./labels";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex flex-1 flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h1 className="text-hero font-semibold text-fg">{TAB.title}</h1>
      <p className="max-w-md text-subtle">
        Hold oversikt over kjøretøy og kommende EU-kontroller.
      </p>

      <Link href="/vehicles" className="btn btn-menu border-accent-weak/60">
        Gå til kjøretøy
      </Link>
    </main>
  );
}

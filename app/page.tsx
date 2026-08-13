import Link from "next/link";
import { LABELS } from "@features/labels";
import { ThemeToggle } from "@/components/organisms/ThemeToggle";

export default function Home() {
  return (
    <main className="mx-auto flex flex-1 flex-col flex-center gap-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center gap-3">
        <h1 className="text-hero font-semibold tracking-tight text-fg">
          {LABELS.appTitle}
        </h1>
        <p className="max-w-sm text-sm text-subtle text-balance">
          {LABELS.home.tagline}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Link
          href="/eu-inspections"
          className="btn btn-menu w-full !flex-center"
        >
          {LABELS.home.goToEuInspections}
        </Link>
        <Link href="/vehicles" className="btn btn-menu w-full !flex-center">
          {LABELS.home.goToVehicles}
        </Link>
      </div>
    </main>
  );
}

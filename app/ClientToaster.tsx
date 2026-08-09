"use client";

import dynamic from "next/dynamic";

/**
 * Client-only loader for <ResponsiveToaster />.
 *
 * ResponsiveToaster reads browser APIs (window.matchMedia) to pick its
 * position, so it must never render during SSR. We load it with
 * `dynamic(..., { ssr: false })` to skip server rendering entirely.
 *
 * Why this wrapper exists: `next/dynamic` with `ssr: false` is NOT allowed
 * inside a Server Component (the root layout). It has to be called from a
 * Client Component — hence this "use client" file, which the server layout
 * can safely import and render.
 */
export const ClientToaster = dynamic(
  () => import("@/components/ResponsiveToaster").then((m) => m.ResponsiveToaster),
  { ssr: false },
);

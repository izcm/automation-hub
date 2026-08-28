import { IconBtn } from "@a2zb/react";
import { cn } from "@/lib/cn";

import { OpenWorkspaceOverlay } from "@/components/icons";
import type { Vehicle } from "@/types/vehicle";

type Props = {
  vehicle: Vehicle;
  className?: string;
  onOpenInWorkspace: () => void;
};

export function VehicleCard({ vehicle, className, onOpenInWorkspace }: Props) {
  const { plateNumber, make, model, vehicleType, fuelType, firstRegistered } =
    vehicle;

  const meta = [vehicleType, fuelType].filter(Boolean).join(" · ");

  return (
    <article className={cn("@container text-start", className)}>
      {/* below ~480px of *its own* container width, stack instead of clip */}
      <div className="flex gap-4 p-5 @max-[480px]:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="self-start rounded border border-line px-2 py-0.5 font-mono text-sm font-semibold tracking-widest text-fg">
            {plateNumber}
          </span>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-fg">
              {make} {model}
            </h3>
            {meta && <p className="truncate text-sm text-subtle">{meta}</p>}
          </div>

          {firstRegistered && (
            <p className="mt-auto text-xs text-muted">
              First registered {firstRegistered}
            </p>
          )}
        </div>

        {/* wide: truck over button, pinned right.
            compact: full-width row — truck left, button right. */}
        <div className="flex shrink-0 flex-col items-center justify-evenly gap-3 @max-[480px]:flex-row @max-[480px]:justify-between">
          {/* placeholder truck silhouette — swap in the real SVG later */}
          <div className="w-24 shrink-0 text-muted/40">
            <TruckSilhouette />
          </div>
          <IconBtn
            className="flex-row-reverse whitespace-nowrap"
            onClick={onOpenInWorkspace}
            icon={OpenWorkspaceOverlay}
          >
            Open vehicle in workspace
          </IconBtn>
        </div>
      </div>
    </article>
  );
}

function TruckSilhouette() {
  return (
    <svg
      viewBox="0 0 140 80"
      className="h-auto w-full"
      fill="transparent"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="6" y="20" width="70" height="34" rx="3" />
      <path d="M78 30 h20 l16 12 v12 h-36 z" />
      <circle cx="34" cy="58" r="10" />
      <circle cx="98" cy="58" r="10" />
      <circle cx="34" cy="58" r="4" fill="var(--raised)" />
      <circle cx="98" cy="58" r="4" fill="var(--raised)" />
    </svg>
  );
}

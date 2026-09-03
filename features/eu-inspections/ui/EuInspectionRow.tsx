import { IconBtn } from "@a2zb/react";
import { getDaysUntil } from "@a2zb/lib";

import { cn } from "@lib/cn";

import { OpenWorkspaceOverlay, Plus } from "@components/icons";
import { DateStamp, MediaLabel } from "@/components/molecules";
import { NotificationRowStatus } from "@/features/notifications/ui/NotificationRowStatus";

import type {
  EuInspectionRow,
  EU_INSPECTIONS_LABELS,
} from "@/features/eu-inspections";
import type { NotificationStatus } from "@/types/notification";

type Props = {
  item: EuInspectionRow;
  picked: boolean;
  activeId: string | undefined;
  setActiveId: (id: string) => void;
  statusBySubjectId: Map<string, NotificationStatus>;
  LABELS: (typeof EU_INSPECTIONS_LABELS)["en"];
  mode?: "inspection" | "batchSelect";
};

// Important read! : https://tailwindcss.com/docs/responsive-design
// also: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries
export function EuInspectionRow({
  item,
  picked,
  activeId,
  setActiveId,
  statusBySubjectId,
  LABELS,
  mode = "inspection",
}: Props) {
  return (
    <div
      className={cn(
        // base styling
        "flex-1 grid",
        "items-center gap-4",
        "rounded border border-extra-faint bg-raised",

        // narrow container
        "grid-cols-[auto_minmax(0,1fr)]",

        // wide container
        "@min-[512px]:grid-cols-[40%_auto_minmax(0,1fr)]",

        // conditional styling
        picked && "border border-accent", // picked = when member of batch select
        activeId === item.id && // active = the item open in workspace
          "border-l-4 border-l-accent-strong/80 bg-elevated-alt/60",
      )}
    >
      <div className="flex gap-2">
        <MediaLabel
          media={<DateStamp date={item.euDate} />}
          title={item.vehicle.plateNumber}
          subtitle={
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 text-subtle/80">
                {LABELS.euDate}:
                <span className="tabular-nums"> {item.euDate}</span>
              </span>

              {(() => {
                const days = getDaysUntil(item.euDate);
                return (
                  <span
                    className={cn(
                      "text-accent",
                      days < 30 && "text-warning",
                      "bg-current/8 border border-current/12",
                      "rounded text-center",
                    )}
                  >
                    {days > 365
                      ? "In 1+ years"
                      : days > 0
                        ? `In ${days} days`
                        : // : `${Math.abs(days)} days overdue`}
                          `overdue`}
                  </span>
                );
              })()}
            </div>
          }
        />
      </div>

      {/* CHILDREN */}
      <div className="flex gap-3 min-w-0">
        <div className="vertical-line" />

        <div className="flex flex-col justify-center text-sm min-w-0">
          <NotificationRowStatus
            status={statusBySubjectId.get(item.id)}
            mostRecent={item.notifications[0]}
            sendingTitle={LABELS.sendingNotification}
          />
        </div>
      </div>

      <IconBtn
        className={cn(
          // narrow container
          "py-3 px-2 hover:text-accent justify-self-end",
          "col-span-full w-full rounded-t-none mr-auto",
          "bg-[light-dark(var(--elevated-alt),var(--lowered))]",

          // wide container
          "@min-[512px]:py-1 @min-[512px]:col-span-1 @min-[512px]:w-auto @min-[512px]:bg-transparent @min-[512px]:rounded @min-[512px]:mr-1",

          activeId === item.id &&
            "[&>svg]:!text-muted cursor-default pointer-events-none hover:text-muted",
        )}
        onClick={() => {
          if (mode === "inspection") setActiveId(item.id);
        }}
        icon={mode === "batchSelect" ? Plus : OpenWorkspaceOverlay}
      >
        {mode === "batchSelect"
          ? LABELS.addToBatch
          : activeId === item.id
            ? LABELS.inWorkspace
            : LABELS.openInWorkspace}
      </IconBtn>
    </div>
  );
}

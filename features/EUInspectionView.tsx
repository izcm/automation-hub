"use client";

import type { Vehicle } from "@/types/vehicle";

import { cn } from "@lib/cn";

import { LABELS, listViewLabels } from "@features/labels";
import { useSendNotifications } from "@features/notifications/hooks";

import { Notify } from "@components/icons";

import { DateStamp, SimpleRow } from "@/components/molecules";
import { ResourceManagementView } from "@/components/organisms";

type Props = {
  vehicles: Vehicle[];
};

export function EUInspectionView({ vehicles }: Props) {
  const sendNotifs = useSendNotifications();

  return (
    <ResourceManagementView
      items={vehicles}
      getId={(v) => v.id}
      labels={listViewLabels}
      batchActions={[
        {
          label: (count) => LABELS.list.notify(count),
          icon: <Notify size={15} />,
          onClick: (vehicleIds) =>
            sendNotifs.mutate({
              ids: vehicleIds,
              channel: "email",
              useCase: "eu-inspection-reminder",
            }),
        },
      ]}
      listItem={(v, picked, selectedCount) => (
        <SimpleRow
          className={cn(
            "rounded-lg border",
            picked ? "border-accent" : "border-transparent",
          )}
          media={<DateStamp date={v.euDate} />}
          title={v.plateNumber}
          subtitle={
            <span className="text-subtle">
              {LABELS.list.euDate}: {v.euDate}
            </span>
          }
          endContent={
            selectedCount > 0 ? (
              <input
                type="checkbox"
                checked={picked}
                readOnly
                className="pointer-events-none mr-2 h-4 w-4 accent-accent"
              />
            ) : undefined
          }
        />
      )}
    />
  );
}

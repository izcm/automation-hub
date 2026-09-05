import { useMutation } from "@tanstack/react-query";
import { postJsonOrThrow } from "@a2zb/lib";
import { rejectWith } from "@lib/toast";

export function useNotifyEuInspections() {
  return useMutation({
    mutationFn: ({
      euInspectionIds,
      channel,
    }: {
      euInspectionIds: string[];
      channel: string; // api layer verifies with zod
    }) =>
      postJsonOrThrow<{ euInspectionId: string; notificationId: string }[]>(
        "/api/eu-inspections/notify",
        { euInspectionIds, channel },
      ),
    onError: (error) =>
      rejectWith("Couldn't queue notifications", error.message),
  });
}

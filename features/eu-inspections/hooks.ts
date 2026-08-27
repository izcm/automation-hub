import { useMutation } from "@tanstack/react-query";

import { postJson } from "@lib/http";
import { confirmWith, rejectWith } from "@lib/toast";

export function useNotifyEuInspections() {
  return useMutation({
    mutationFn: ({
      euInspectionIds,
      channel,
    }: {
      euInspectionIds: string[];
      channel: string; // api layer verifies with zod
    }) => postJson("/api/eu-inspections/notify", { euInspectionIds, channel }),
    onSuccess: () => confirmWith("Server queued notifications"),
    onError: (error) => rejectWith("Something went wrong", error.message),
  });
}

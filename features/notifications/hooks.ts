import { useMutation } from "@tanstack/react-query";

import { postJson } from "@lib/http";
import { confirmWith, rejectWith } from "@lib/toast";

export function useSendNotifications() {
  return useMutation({
    mutationFn: ({
      payload, // shape depends on useCase — eg. { vehicleIds } for eu-inspection-reminder
      useCase,
      channel,
    }: {
      payload: Record<string, unknown>;
      useCase: string; // api layer verifies with zod
      channel: string; // api layer verifies with zod
    }) => postJson("/api/notifications", { payload, channel, useCase }),
    onSuccess: () => confirmWith("Server queued notifications"),
    onError: (error) => rejectWith("Something went wrong", error.message),
  });
}

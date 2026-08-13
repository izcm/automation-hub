import { useMutation } from "@tanstack/react-query";

import { postJson } from "@lib/http";
import { confirmWith, rejectWith } from "@lib/toast";

export function useSendNotifications() {
  return useMutation({
    mutationFn: ({
      ids, // id of some resource, eg. vehicleIds for eu controll
      useCase,
      channel,
    }: {
      ids: string[];
      useCase: string; // api layer verifies with zod
      channel: string; // api layer verifies with zod
    }) => postJson("/api/notifications", { ids, channel, useCase }),
    onSuccess: () => confirmWith("Varsler sendt"),
    onError: (error) => rejectWith("Det har skjedd en feil", error.message),
  });
}

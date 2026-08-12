import { useMutation } from "@tanstack/react-query";

import { postJson } from "@lib/http";
import { confirmWith, rejectWith } from "@lib/toast";

export function useSendNotifications() {
  return useMutation({
    mutationFn: (vehicleIds: string[]) =>
      postJson("/api/notifications", { vehicleIds, channel: "email" }),
    onSuccess: () => confirmWith("Varsler sendt"),
    onError: (error) => rejectWith("Det har skjedd en feil", error.message),
  });
}

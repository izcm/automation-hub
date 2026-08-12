import { useMutation } from "@tanstack/react-query";

import { postJson } from "@lib/http";
import { confirmWith, rejectWith } from "@lib/toast";

export function useAddVehicle() {
  return useMutation({
    mutationFn: (plateNumber: string) =>
      postJson("/api/vehicles", { plateNumber }),
    onSuccess: () => confirmWith("Kjøretøy lagt til"),
    onError: (error) => rejectWith("Det har skjedd en feil", error.message),
  });
}

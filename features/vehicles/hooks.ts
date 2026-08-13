import { useMutation } from "@tanstack/react-query";

import { postJson } from "@lib/http";
import { confirmWith, rejectWith } from "@lib/toast";

export function useAddVehicle() {
  return useMutation({
    mutationFn: (plateNumber: string) =>
      postJson("/api/vehicles", { plateNumber }),
    onSuccess: () => confirmWith("Vehicle added"),
    onError: (error) => rejectWith("Something went wrong", error.message),
  });
}

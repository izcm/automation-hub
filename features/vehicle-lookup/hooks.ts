import { useMutation } from "@tanstack/react-query";
import { postJsonOrThrow } from "@a2zb/lib";

import { confirmWith, rejectWith } from "@lib/toast";

export function useAddVehicle() {
  return useMutation({
    mutationFn: (plateNumber: string) =>
      postJsonOrThrow("/api/vehicles", { plateNumber }),
    onSuccess: () => confirmWith("Vehicle added"),
    onError: (error) => rejectWith("Something went wrong", error.message),
  });
}

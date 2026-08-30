import { useMutation } from "@tanstack/react-query";

import { postJsonOrThrow } from "@/lib/fetch-json-or-throw";
import { confirmWith, rejectWith } from "@lib/toast";

export function useAddVehicle() {
  return useMutation({
    mutationFn: (plateNumber: string) =>
      postJsonOrThrow("/api/vehicles", { plateNumber }),
    onSuccess: () => confirmWith("Vehicle added"),
    onError: (error) => rejectWith("Something went wrong", error.message),
  });
}

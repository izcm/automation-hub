import { toast } from "sonner";

// Sonner's per-toast options type (icon, action, duration, className, …).
type ToastOpts = Parameters<typeof toast.success>[1];

export function confirmWith(
  title: string,
  description?: string,
  opts?: ToastOpts,
) {
  toast.success(title, { description, ...opts });
}

export function rejectWith(
  title: string,
  description?: string,
  opts?: ToastOpts,
) {
  toast.error(title, { description, ...opts });
}

export function warningWith(
  title: string,
  description?: string,
  opts?: ToastOpts,
) {
  toast.warning(title, { description, ...opts });
}

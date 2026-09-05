import { Result } from "@a2zb/lib";

export async function safeAction<T>(
  fn: () => Promise<T>,
  fallback = "Something went wrong",
): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    console.error("safeAction failed:", error);
    return { ok: false, error: fallback };
  }
}

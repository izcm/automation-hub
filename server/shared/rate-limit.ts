const rateLimitMap = new Map<
  string,
  {
    count: number;
    lastReset: number;
  }
>();

export function isRateLimited(ip: string): boolean {
  const limit = 5;
  const windowMs = 60_000;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now(),
    });
  }

  const ipData = rateLimitMap.get(ip)!;

  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0;
    ipData.lastReset = Date.now();
  }

  if (ipData.count >= limit) {
    return true;
  }

  ipData.count++;

  return false;
}

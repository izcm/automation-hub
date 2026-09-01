import { useState } from "react";

// generic, app-agnostic: validates raw input against a regex, optionally
// normalizing it first (e.g. casing/whitespace) — caller owns the pattern
export function useRegexValidatedInput(
  pattern: RegExp,
  normalize: (value: string) => string = (value) => value,
) {
  const [hasError, setHasError] = useState(false);

  const parse = (input: string): string | null => {
    const normalized = normalize(input);

    if (!normalized.match(pattern)) {
      setHasError(true);
      return null;
    }

    setHasError(false);
    return normalized;
  };

  return { hasError, setHasError, parse };
}

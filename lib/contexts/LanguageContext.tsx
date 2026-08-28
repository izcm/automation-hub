"use client";

import { createContext, useContext, ReactNode } from "react";

const LanguageContext = createContext<string>("en");

// Hardcoded — no persistence, no switching. Swap the value here once there's
// a real source (cookie, user setting, ...) to read the language from.
// Generic on purpose — this context doesn't know about the app's specific
// language union; callers narrow the returned string themselves.
export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider value="en">{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): string {
  return useContext(LanguageContext);
}

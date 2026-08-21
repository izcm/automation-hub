"use client";

import { createContext, useContext, ReactNode } from "react";

import type { Language } from "@/features/language/field-config";

const LanguageContext = createContext<Language>("en");

// Hardcoded — no persistence, no switching. Swap the value here once there's
// a real source (cookie, user setting, ...) to read the language from.
export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider value="en">{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

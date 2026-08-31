// responsive-toaster.tsx
"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export function ResponsiveToaster() {
  const [isSmallerScreen, setIsSmallerScreen] = useState(
    () => window.matchMedia("(max-width: 1024px)").matches,
  );

  useEffect(() => {
    // NEW object/reference HERE, but this line runs ONCE
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using*
    const query = window.matchMedia("(max-width: 1024px)");

    const update = () => setIsSmallerScreen(query.matches);

    // Listener attached ONCE
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <Toaster
      // top-center
      position={isSmallerScreen ? "top-center" : "bottom-right"}
      richColors
      closeButton
      // hotkey={["KeyK"]}
      toastOptions={{
        classNames: {
          toast: "rounded-xl shadow-[var(--panel-shadow)]",
          title: "text-sm font-semibold",
          description: "text-xs opacity-70",
        },
      }}
    />
  );
}

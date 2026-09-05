"use client";

import { useRef, useState } from "react";

import { DemoEmailModal } from "./DemoEmailModal";

// Answers exactly one question: which email should this send use? Shows the
// modal (once per session) and waits for an answer. Doesn't know about
// sending, ids, or anything else — that all stays with the caller.
export function useDemoInboxChoice({
  alternativeReceiver,
}: {
  alternativeReceiver?: string;
}) {
  const hasAsked = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const resolverRef = useRef<((email?: string) => void) | null>(null);

  function getEmailChoice(): Promise<string | undefined> {
    if (hasAsked.current) return Promise.resolve(undefined);

    setShowModal(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }

  function resolve(overrideEmail?: string) {
    hasAsked.current = true;
    setShowModal(false);
    resolverRef.current?.(overrideEmail);
    resolverRef.current = null;
  }

  const modal = (
    <DemoEmailModal
      isOpen={showModal}
      alternativeReceiver={alternativeReceiver}
      onSkip={() => resolve()}
      onSendToInbox={() => resolve(alternativeReceiver)}
    />
  );

  return { getEmailChoice, modal };
}

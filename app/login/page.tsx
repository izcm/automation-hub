"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

import { LoginModal, type OIDCProvider } from "@/components/organisms";
import { MicrosoftIcon } from "@/components/icons";

import { AppModal } from "@/features/ui/AppModal";
import {
  loginWithDemoCredentials,
  setEmailStorage,
} from "@/features/server-actions";
import { BackdropLayout } from "@/features/ui/BackdropLayout";

const SUCCESS_REDIRECT_PATH = "/";

export default function LoginPage() {
  const router = useRouter();
  // TODO demo-only GDPR consent gate — remove once a real consent flow exists
  const [showGdprConsent, setShowGdprConsent] = useState(false);

  const oidcProviders: OIDCProvider[] = [
    {
      label: "Microsoft Entra ID",
      icon: <MicrosoftIcon className="h-4 w-4" />,
      buttonProps: {
        tabIndex: 0,
        onClick: (e) => {
          e.preventDefault();
          setShowGdprConsent(true);
        },
      },
    },
  ];

  const sharedClasses =
    "border border-line rounded bg-elevated [&:button]:base-element [&:input]:base-element";

  return (
    <>
      <BackdropLayout>
        <div className="flex flex-col justify-center gap-3 h-full mx-auto w-sm">
          <LoginModal
            containerClassName={sharedClasses}
            oidcProviders={oidcProviders}
            onCredentialsSubmit={async (formData) => {
              await loginWithDemoCredentials(formData);
              router.push(SUCCESS_REDIRECT_PATH);
            }}
          />

          <div className={cn(sharedClasses, "p-4 flex flex-col gap-2")}>
            <span className="text-xs text-subtle">
              Microsoft Entra or sign in with the demo account
            </span>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-16 text-subtle">Username</span>
                <code className="rounded bg-raised px-2 py-0.5 text-xs">
                  demo
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-subtle">Password</span>
                <code className="rounded bg-raised px-2 py-0.5 text-xs">
                  demo
                </code>
              </div>
            </div>
          </div>
        </div>
      </BackdropLayout>

      {showGdprConsent && (
        <AppModal
          isOpen={showGdprConsent}
          onClose={() => setShowGdprConsent(false)}
          className="w-md"
          title="Notification feature"
        >
          <div className="flex flex-col gap-3 text-sm text-subtle">
            <p>
              The demo has a notification feature, you can test it using your
              own inbox.
            </p>
            <p>
              Would you like{" "}
              <strong className="font-semibold text-fg">IZBLOCKS</strong> to
              store your Microsoft email so you don’t have to enter it manually
              later?
            </p>
            <p className="font-semibold text-fg">
              It’s never shown to other users. Deleted within 24h, or when you
              log out.
            </p>
            <p>
              Prefer not? You can still test the notification flow in the app —
              you just won’t receive the email yourself.
            </p>
          </div>

          <form action={setEmailStorage} className="flex justify-end gap-2 h-8">
            <button name="storeEmail" value="false" className="btn btn-neutral">
              Don’t store
            </button>
            <button
              name="storeEmail"
              value="true"
              className="btn btn-secondary"
            >
              Store email
            </button>
          </form>
        </AppModal>
      )}
    </>
  );
}

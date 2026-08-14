"use client";

import { ReactNode } from "react";
import { IconBtn, Modal, TextInput } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Lock } from "@/components/icons";

type Props = {
  containerClassName?: string;
};

function MicrosoftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21"
    >
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

export function LoginModal({ containerClassName }: Props) {
  return (
    <Modal
      isOpen
      onClose={() => {}}
      hideCancelBtn
      bare
      noOverlay
      ariaLabel="Log in"
      className={cn(
        `
        w-full max-w-sm
        flex flex-col gap-5
        p-6

        bg-base/50
        backdrop-blur-lg

        border border-faint/40
        rounded-lg

        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      `,
        containerClassName,
      )}
    >
      <div
        className="
        grid place-items-center 
        rounded-full bg-lowered/60
        mx-auto h-12 w-12"
      >
        <Lock stroke-width="1" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Welcome</h2>
        <span className="text-xs text-subtle">
          Log in to continue to your account
        </span>
      </div>

      <IconBtn
        icon={MicrosoftIcon}
        className="btn btn-neutral justify-end flex-row-reverse py-3"
      >
        Microsoft Entra ID
      </IconBtn>

      <div className="flex flex-center gap-4">
        <div className="bg-fg/40 h-[1px] flex-1" />
        <span className="text-xs text-muted">OR</span>
        <div className="bg-fg/40 h-[1px] flex-1" />
      </div>

      <div className="flex flex-col gap-2">
        <TextInput className="text-input" placeholder="Email address" />
        <TextInput className="text-input" placeholder="Password" />
      </div>

      <button className="btn btn-inverted">Log in</button>
    </Modal>
  );
}

"use client";

import { IconBtn } from "@a2zb/react";
import { TextInput } from "./TextInput";
import { GlassModal } from "./GlassModal";

import { Lock, Mail } from "@/components/icons";
import Link from "next/link";
import { cn } from "@/lib/cn";

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
    <GlassModal
      ariaLabel="Log in"
      containerClassName={cn(containerClassName, "p-6")}
    >
      <div
        className="
        grid place-items-center 
        rounded-full bg-raised
        mx-auto h-12 w-12"
      >
        <Lock strokeWidth="1" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Welcome</h2>
        <span className="text-xs text-subtle">
          Log in to continue to your account
        </span>
      </div>

      <IconBtn
        icon={MicrosoftIcon}
        className="btn btn-neutral justify-center flex-row-reverse py-3"
      >
        Microsoft Entra ID
      </IconBtn>

      <div className="flex flex-center gap-4">
        <div className="line flex-1" />
        <span className="text-xs text-muted">OR</span>
        <div className="line flex-1" />
      </div>

      <div className="flex flex-col gap-2">
        <TextInput placeholder="Email address" startIcon={<Mail size={16} />} />
        <TextInput placeholder="Password" startIcon={<Lock size={16} />} />
      </div>

      <Link href={"/"} className="btn btn-primary">
        Log In
      </Link>
      {/* <button className="btn btn-inverted">Log in</button> */}
    </GlassModal>
  );
}

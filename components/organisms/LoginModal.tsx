"use client";

import { cn } from "@/lib/cn";

import { LoginForm, type LoginFormProps } from "./LoginForm";

export type { OIDCProvider } from "./LoginForm";

type Props = Omit<LoginFormProps, "className"> & {
  containerClassName?: string;
};

export function LoginModal({ containerClassName, ...formProps }: Props) {
  return (
    <div
      aria-label="Log in"
      className={cn(
        "shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
        containerClassName,
        "p-6",
      )}
    >
      <LoginForm {...formProps} />
    </div>
  );
}

"use client";

import { ComponentProps, ReactNode, useState } from "react";
import { Spinner, TextInput } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Lock, Mail } from "@/components/icons";

import { rejectWith } from "@/lib/toast";

export type OIDCProvider = {
  label: ReactNode;
  icon?: ReactNode;
  buttonProps: ComponentProps<"a">;
};

export type LoginFormProps = {
  className?: string;

  oidcProviders: OIDCProvider[];

  // caller-provided server function — handles the credentials POST, session,
  // and success redirect itself
  onCredentialsSubmit: (formData: FormData) => Promise<void>;
};

export function LoginForm({
  className,
  oidcProviders,
  onCredentialsSubmit,
}: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2 text-start">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <span className="text-xs text-subtle">
          Log in to continue to your account
        </span>
      </div>

      {oidcProviders.map(({ label, icon, buttonProps }, i) => (
        <a
          key={i}
          {...buttonProps}
          className={cn(
            "flex w-full btn btn-secondary text-fg py-2.5",
            buttonProps.className,
          )}
        >
          {icon}
          <span>{label}</span>
        </a>
      ))}

      <div className="flex flex-center gap-4">
        <div className="horizontal-line flex-1" />
        <span className="text-xs text-muted">OR</span>
        <div className="horizontal-line flex-1" />
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          try {
            const formData = new FormData(e.currentTarget);
            await onCredentialsSubmit(formData);
          } catch (err) {
            rejectWith(
              "Couldn't log in.",
              typeof err === "string" ? err : "There was an issue logging in.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="flex flex-col gap-2">
          <TextInput
            className="base-element"
            htmlInputProps={{
              name: "username",
              placeholder: "Email address",
              "aria-label": "Email address",
              required: true,
            }}
            startIcon={<Mail size={16} />}
          />
          <TextInput
            className="base-element"
            htmlInputProps={{
              name: "password",
              placeholder: "Password",
              "aria-label": "Password",
              type: "password",
              required: true,
            }}
            startIcon={<Lock size={16} />}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner size={16} />}
          Log In
        </button>
      </form>
    </div>
  );
}

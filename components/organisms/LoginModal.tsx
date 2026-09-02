"use client";

import { ComponentProps, ReactNode } from "react";
import { TextInput } from "@a2zb/react";

import { cn } from "@/lib/cn";
import { Lock, Mail } from "@/components/icons";

import { postJsonOrThrow } from "@/lib/fetch-json-or-throw";
import { rejectWith } from "@/lib/toast";

export type OIDCProvider = {
  label: ReactNode;
  icon?: ReactNode;
  buttonProps: ComponentProps<"a">;
};

type Props = {
  containerClassName?: string;

  oidcProviders: OIDCProvider[];

  endpoints: {
    credentialsLogin: string;
  };

  // called once the credentials POST succeeds — caller decides what happens next
  onCredentialsLoginSuccess: () => void;
};

export function LoginModal({
  containerClassName,
  oidcProviders,
  endpoints,
  onCredentialsLoginSuccess,
}: Props) {
  return (
    <div
      aria-label="Log in"
      className={cn(
        "flex flex-col gap-6",
        "shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
        containerClassName,
        "p-6",
      )}
    >
      <div
        className="
        grid place-items-center
        rounded-full bg-raised
        mx-auto h-12 w-12"
      >
        <Lock strokeWidth="1" />
      </div>

      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <span className="text-xs text-subtle">
          Log in to continue to your account
        </span>
      </div>

      {oidcProviders.map(({ label, icon, buttonProps }, i) => (
        <a
          key={i}
          {...buttonProps}
          className={cn(
            "flex w-full btn btn-neutral py-3",
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
          try {
            const formData = new FormData(e.currentTarget);

            const username = formData.get("username");
            const password = formData.get("password");

            await postJsonOrThrow(endpoints.credentialsLogin, {
              username,
              password,
            });
            onCredentialsLoginSuccess();
          } catch (err) {
            rejectWith(
              "Couldn't log in.",
              typeof err === "string" ? err : "There was an issue logging in.",
            );
          }
        }}
      >
        <div className="flex flex-col gap-2">
          <TextInput
            input={{
              name: "username",
              placeholder: "Email address",
              required: true,
            }}
            startIcon={<Mail size={16} />}
          />
          <TextInput
            input={{
              name: "password",
              placeholder: "Password",
              type: "password",
              required: true,
            }}
            startIcon={<Lock size={16} />}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Log In
        </button>
      </form>
    </div>
  );
}

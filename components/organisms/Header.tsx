"use client";

import Link from "next/link";
import { Popover } from "@a2zb/react";

import { Back, ChevronDown, LogOut } from "../icons";
import { ThemeToggle } from "./ThemeToggle";
import { postJsonOrThrow } from "@/lib/fetch-json-or-throw";
import { rejectWith } from "@/lib/toast";

export type HeaderLabels = {
  back: string;
  menu: string;
  logOut: string;
  theme: { toLight: string; toDark: string };
};

type Props = {
  backHref?: string;
  title?: string;
  labels: HeaderLabels;
  logoutEndpoint: string;
};

export function Header({ backHref, title, labels, logoutEndpoint }: Props) {
  return (
    <div className="relative flex items-center justify-between">
      {backHref ? (
        <Link href={backHref} className="btn btn-menu" aria-label={labels.back}>
          <Back size={16} />
        </Link>
      ) : (
        <span />
      )}

      {title && <h1 className="font-medium text-fg/80">{title}</h1>}

      <Popover
        align="right"
        contentClassName="raised-outline"
        trigger={
          <button className="btn btn-menu" aria-label={labels.menu}>
            <ChevronDown size={16} />
          </button>
        }
      >
        <div className="flex flex-col gap-1">
          <ThemeToggle labels={labels.theme} />
          <button
            className="btn btn-menu gap-2"
            onClick={async () => {
              try {
                await postJsonOrThrow(logoutEndpoint, {});
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- hard reload is intentional
                window.location.href = "/";
              } catch (err) {
                rejectWith(
                  "Couldn't log out.",
                  typeof err === "string"
                    ? err
                    : "There was an issue logging out.",
                );
              }
            }}
          >
            <LogOut size={16} />
            {labels.logOut}
          </button>
        </div>
      </Popover>
    </div>
  );
}

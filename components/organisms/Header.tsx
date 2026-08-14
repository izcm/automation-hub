"use client";

import Link from "next/link";
import { Popover } from "@a2zb/react";

import { Back, ChevronDown, LogOut } from "../icons";
import { ThemeToggle } from "./ThemeToggle";

export type HeaderLabels = {
  back: string;
  menu: string;
  logOut: string;
};

type Props = {
  backHref?: string;
  title?: string;
  labels: HeaderLabels;
};

export function Header({ backHref, title, labels }: Props) {
  return (
    <div className="relative flex items-center justify-between">
      {backHref ? (
        <Link href={backHref} className="btn btn-menu" aria-label={labels.back}>
          <Back size={16} />
        </Link>
      ) : (
        <span />
      )}

      {title && <h1 className="font-medium text-subtle">{title}</h1>}

      <Popover
        align="right"
        trigger={
          <button className="btn btn-menu" aria-label={labels.menu}>
            <ChevronDown size={16} />
          </button>
        }
      >
        <div className="flex flex-col gap-1">
          <ThemeToggle />
          <button className="btn btn-menu gap-2">
            <LogOut size={16} />
            {labels.logOut}
          </button>
        </div>
      </Popover>
    </div>
  );
}

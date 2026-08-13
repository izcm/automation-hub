"use client";

import Link from "next/link";
import { Popover } from "@a2zb/react";

import { LABELS } from "@features/labels";
import { Back, ChevronDown, LogOut } from "../icons";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  hasBack?: boolean;
  title?: string;
};

export function Header({ hasBack, title }: Props) {
  return (
    <div className="relative flex items-center justify-between">
      {hasBack ? (
        <Link href="/" className="btn btn-menu" aria-label={LABELS.header.back}>
          <Back size={16} />
        </Link>
      ) : (
        <span />
      )}

      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-subtle">
          {title}
        </h1>
      )}

      <Popover
        align="right"
        trigger={
          <button className="btn btn-menu" aria-label={LABELS.header.menu}>
            <ChevronDown size={16} />
          </button>
        }
      >
        <div className="flex flex-col gap-1">
          <ThemeToggle />
          <button className="btn btn-menu gap-2">
            <LogOut size={16} />
            {LABELS.header.logOut}
          </button>
        </div>
      </Popover>
    </div>
  );
}

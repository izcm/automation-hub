"use client";

import { TextInput } from "@a2zb/react";

import { Filter } from "../icons";

type Props = {
  searchPlaceholder: string;
  applyLabel: string;
  filterLabel: string;
};

export function FilterBar({
  searchPlaceholder,
  applyLabel,
  filterLabel,
}: Props) {
  return (
    <div className="flex gap-3 flex-1">
      <TextInput
        submitLabel={applyLabel}
        className="border-muted/60 !bg-raised flex-1"
        placeholder={searchPlaceholder}
      />
      <button className="btn btn-secondary">
        <Filter size={16} />
        <span>{filterLabel}</span>
      </button>
    </div>
  );
}

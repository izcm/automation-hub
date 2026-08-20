import { TextInput } from "@a2zb/react";

import { Filter } from "../icons";
import { useState } from "react";

export type SearchConfig = { keyMap: Record<string, string> };

type Props = {
  searchPlaceholder: string;
  applyLabel: string;
  filterLabel: string;
  searchConfig: SearchConfig;
  handleSearch: (search: string) => void;
};

export function FilterBar({
  searchPlaceholder,
  applyLabel,
  filterLabel,
  searchConfig,
  handleSearch,
}: Props) {
  const [searchInput, setSearchInput] = useState<string>("");

  return (
    <div className="flex gap-3 flex-1">
      <TextInput
        value={searchInput}
        onSubmit={(value) => {
          handleSearch(value);
          setSearchInput(value);
        }}
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

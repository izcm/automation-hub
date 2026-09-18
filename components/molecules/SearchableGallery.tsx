import { ComponentProps, ReactNode, useState } from "react";

import { Gallery, TextInput } from "@a2zb/react";
import { cn } from "@/lib/cn";

type Props<T> = {
  options: T[];

  getLabel?: (option: T) => string;
  getKey?: (option: T) => string;

  searchable?: boolean;
  // after picking an item, fill the search box with its label — makes sense
  // for single-select (confirms the pick) but not multi-select (you're
  // often picking more than one, so the box shouldn't snap to the last one).
  syncSearchOnCommit?: boolean;

  galleryItem: (option: T, handleCommit: (option: T) => void) => ReactNode;

  onCommit: (option: T) => void;

  // fully excludes an option from interaction — no click, no Enter, no Tab
  // focus, no arrow-key nav (ArrowRow/ArrowList handle this once given the
  // option). For "looks disabled but still reachable," don't use this —
  // just style it yourself in `galleryItem` instead.
  isDisabled?: (option: T) => boolean;

  textInputProps?: ComponentProps<typeof TextInput>;
  galleryClassName?: ComponentProps<typeof Gallery>["className"];
};

// the search box + filtered list that Dropdown wraps in a popover — pulled
// out so it can also be dropped in as plain content inside a popover that's
// already open (eg. FilterBar's "+ Add filter" drill-down), without nesting
// a second popover or re-implementing the search-filter logic.
export function SearchableGallery<T = string>({
  options,
  getLabel = (option) => String(option),
  getKey = getLabel,
  searchable = false,
  syncSearchOnCommit = true,
  galleryItem,
  onCommit,
  isDisabled,
  textInputProps,
  galleryClassName,
}: Props<T>) {
  const [search, setSearch] = useState("");

  // track which item is selected in dropdown
  const [highlighted, setHighlighted] = useState<T | undefined>(undefined);

  // match if the query starts any word in the label — "e" matches "erik"
  // and "issi engel" (second word starts with e), but not "irek"
  const applicable = () => {
    const query = search.toLowerCase();
    if (!query || !searchable) return options;

    return options.filter((option) =>
      getLabel(option)
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.startsWith(query)),
    );
  };

  const handleCommit = (option: T) => {
    onCommit(option);
    if (syncSearchOnCommit) setSearch(getLabel(option));
  };

  const { htmlInputProps, ...restTextInputProps } = textInputProps ?? {};

  return (
    <>
      {searchable && (
        <TextInput
          {...restTextInputProps}
          value={search}
          htmlInputProps={{
            onChange: (e) => setSearch(e.currentTarget.value),
            className: "text-fg",
            ...htmlInputProps,
          }}
          className={cn("h-10 w-full", restTextInputProps.className)}
        />
      )}

      <Gallery
        items={applicable()}
        getId={getKey}
        selected={highlighted}
        onSelect={setHighlighted}
        onEnter={handleCommit}
        isDisabled={isDisabled}
        galleryItem={(option) => galleryItem(option, handleCommit)}
        className={{
          arrowList: cn("flex flex-col gap-0.5", galleryClassName?.arrowList),
          arrowRow: (state) =>
            cn(
              "inset-focus rounded disabled-look",
              galleryClassName?.arrowRow?.(state),
            ),
        }}
      />
    </>
  );
}

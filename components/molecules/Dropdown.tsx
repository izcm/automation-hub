import { ComponentProps, ReactNode, useState } from "react";

import { Gallery, TextInput } from "@a2zb/react";
import { cn } from "@/lib/cn";

import { Popover } from "./FocusDropdown";
import { SearchableGallery } from "./SearchableGallery";

type Props<T> = {
  options: T[];

  getLabel?: (option: T) => string;
  getKey?: (option: T) => string;

  trigger: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;

  searchable?: boolean;
  // after picking an item, fill the search box with its label — makes sense
  // for single-select (confirms the pick) but not multi-select (you're
  // often picking more than one, so the box shouldn't snap to the last one).
  syncSearchOnCommit?: boolean;

  // extra chrome around the search input + list — a title/count row above,
  // a "clear all"/"done" row below. `close` lets footer actions (eg. Done)
  // close the popover without the caller needing its own open/close wiring.
  header?: ReactNode;
  footer?: (close: () => void) => ReactNode;

  galleryItem: (option: T, handleCommit: (option: T) => void) => ReactNode;

  onCommit: (option: T) => void;

  isOptionDisabled?: (option: T) => boolean;

  // omit both to let Dropdown manage its own open state internally
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  popoverProps?: Pick<
    ComponentProps<typeof Popover>,
    "align" | "contentClassName"
  >;
  textInputProps?: ComponentProps<typeof TextInput>;
  galleryClassName?: ComponentProps<typeof Gallery>["className"];
};

export function Dropdown<T = string>({
  options,
  getLabel = (option) => String(option),
  getKey = getLabel,
  trigger,
  searchable = false,
  syncSearchOnCommit = true,
  header,
  footer,
  galleryItem,
  onCommit,
  isOptionDisabled,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  popoverProps,
  textInputProps,
  galleryClassName,
}: Props<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const onOpenChange = onOpenChangeProp ?? setInternalOpen;

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      align={popoverProps?.align}
      contentClassName={cn(
        "w-max rounded shadow-panel",
        popoverProps?.contentClassName,
      )}
      trigger={trigger(open, onOpenChange)}
    >
      {header}

      <SearchableGallery
        options={options}
        getLabel={getLabel}
        getKey={getKey}
        searchable={searchable}
        syncSearchOnCommit={syncSearchOnCommit}
        galleryItem={galleryItem}
        onCommit={onCommit}
        textInputProps={textInputProps}
        galleryClassName={galleryClassName}
        isDisabled={isOptionDisabled}
      />

      {footer?.(() => onOpenChange(false))}
    </Popover>
  );
}

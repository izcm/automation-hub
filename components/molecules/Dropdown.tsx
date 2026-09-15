import { ComponentProps, ReactNode, useRef, useState } from "react";

import { Gallery, TextInput } from "@a2zb/react";
import { cn } from "@/lib/cn";

import { Popover } from "./FocusDropdown";

type Props<T> = {
  options: T[];

  getLabel?: (option: T) => string;
  getKey?: (option: T) => string;

  trigger: ReactNode;

  searchable?: boolean;

  galleryItem: (option: T, handleCommit: (option: T) => void) => ReactNode;

  onCommit: (option: T) => void;

  open: boolean;
  onOpenChange: (open: boolean) => void;

  popoverProps?: Pick<
    ComponentProps<typeof Popover>,
    "align" | "contentClassName"
  >;
  textInputProps?: ComponentProps<typeof TextInput>;
};

export function Dropdown<T = string>({
  options,
  getLabel = (option) => String(option),
  getKey = getLabel,
  trigger,
  searchable,
  galleryItem,
  onCommit,
  open,
  onOpenChange,
  popoverProps,
  textInputProps,
}: Props<T>) {
  const [search, setSearch] = useState("");

  // track which item is selected in dropdown
  const [highlighted, setHighlighted] = useState<T | undefined>(undefined);

  // const inputRef = useRef<HTMLInputElement>(null);

  const applicable = () =>
    options.filter((option) =>
      getLabel(option).toLowerCase().includes(search.toLowerCase()),
    );

  const handleCommit = (option: T) => {
    // keep focus on the input across a commit — otherwise the item you just
    // picked (often the thing with focus, eg. via keyboard nav) disappears
    // when onCommit closes the list, and the browser is left to pick
    // wherever focus goes next.
    // inputRef.current?.focus();
    onCommit(option);
    setSearch(getLabel(option));
  };

  const { htmlInputProps, ...restTextInputProps } = textInputProps ?? {};

  return (
    <>
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        align={popoverProps?.align}
        contentClassName={cn(
          "w-full rounded shadow-lg",
          popoverProps?.contentClassName,
        )}
        trigger={trigger}
      >
        {searchable && (
          <TextInput
            {...restTextInputProps}
            value={search}
            htmlInputProps={{
              // ref: inputRef,
              onChange: (e) => setSearch(e.currentTarget.value),

              onFocus: () => onOpenChange(true),

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
          galleryItem={(option) => galleryItem(option, handleCommit)}
          className={{
            arrowList: "flex flex-col gap-0.5 max-h-[240px]",
            arrowRow: "inset-focus",
          }}
        />
      </Popover>
    </>
  );
}

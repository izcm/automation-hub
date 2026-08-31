import { useState } from "react";
import { Checkbox, Popover, TextInput } from "@a2zb/react";

type Props = {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
};

// Searchable multiselect: the search input doubles as the dropdown's
// trigger, filtering `options` as you type.
export function MultiSelectDropdown({
  options,
  selected,
  onToggle,
  placeholder,
}: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Popover
        open={open}
        onOpenChange={setOpen}
        contentClassName="w-full rounded shadow-lg"
        trigger={
          <div
            className="w-full"
            onClick={(e) => e.stopPropagation()}
            onFocus={() => setOpen(true)}
          >
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder={placeholder}
              className="h-8 w-full [&__input]:text-subtle [&__input]:text-sm"
            />
          </div>
        }
      >
        <div className="flex flex-col gap-0.5">
          {options
            .filter((option) =>
              option.toLowerCase().includes(search.toLowerCase()),
            )
            .map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-fg cursor-pointer hover:bg-lowered"
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onChange={() => onToggle(option)}
                />
                {option}
              </label>
            ))}
        </div>
      </Popover>
    </div>
  );
}

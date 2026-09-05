import { ReactNode, useState } from "react";

import {
  CopyableId,
  SelectDropdown,
  type SelectDropdownProps,
} from "@/components/molecules";
import { Cancel, Confirm, Edit } from "@components/icons";
import { Spinner } from "@a2zb/react";

type EditableEntityRowDeps<T> = {
  id: string;
  label: string;
  icon: ReactNode;
  // `onSelect` is owned internally: picking an option commits immediately
  // and closes edit mode, so the parent only hears about it via `onConfirm`.
  select: Omit<SelectDropdownProps<T>, "onSelect">;
  isLoading?: boolean;
  onConfirm: (value: T) => void;
};

function DisplayEntity({
  id,
  label,
  icon,
}: {
  id: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <>
      <div className="bg-black/12 rounded-full border border-extra-faint p-2">
        {icon}
      </div>
      <div className="flex flex-col">
        <span>{label}</span>
        <div className="text-xs">
          <CopyableId id={id} />
        </div>
      </div>
    </>
  );
}

export function EditableEntityRow<T>({
  id,
  label,
  icon,
  select,
  isLoading,
  onConfirm,
}: EditableEntityRowDeps<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="flex justify-between items-center gap-1 p-1">
      <div className="flex-1 flex items-center gap-3">
        {isUpdating ? (
          <>
            <SelectDropdown
              {...select}
              onSelect={(value) => {
                onConfirm(value);
                setIsUpdating(false);
              }}
              textInputProps={{
                value,
                ...select.textInputProps,
                htmlInputProps: {
                  autoFocus: true,
                  ...select.textInputProps?.htmlInputProps,
                },
              }}
            />
            <button
              disabled={!value}
              className="ml-auto text-accent hover:text-accent-strong"
            >
              <Confirm size={20} />
            </button>
          </>
        ) : (
          <DisplayEntity id={id} label={label} icon={icon} />
        )}
      </div>

      {isLoading ? (
        <span className="inline-flex gap-3 items-center text-accent">
          <span className="text-xs">Updating...</span>
          <Spinner />
        </span>
      ) : (
        <button
          onClick={() => setIsUpdating(!isUpdating)}
          className="p-1 rounded text-accent hover:text-accent-strong"
        >
          {isUpdating ? <Cancel size={20} /> : <Edit size={20} />}
        </button>
      )}
    </div>
  );
}

import { ReactNode, useState } from "react";

import { CopyableId } from "@/components/molecules";
import { Cancel, Confirm, Edit } from "@components/icons";
import { Spinner } from "@a2zb/react";

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
      {icon}
      <div className="flex flex-col">
        <span>{label}</span>
        <div className="text-xs">
          <CopyableId id={id} />
        </div>
      </div>
    </>
  );
}

type EditableEntityRowDeps = {
  id: string;
  label: string;
  icon: ReactNode;
  isLoading?: boolean;
  inline?: boolean; // pass if you want editor to render inline -> swaps with DisplayEntityCard, if not -> leave DisplayEntityCard and render the editor separately

  renderEditor: (props: { isOpen: boolean; onClose: () => void }) => ReactNode;
};

export function EditableEntityRow({
  id,
  label,
  icon,
  isLoading,
  inline: isEditorInline,
  renderEditor,
}: EditableEntityRowDeps) {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center gap-1 p-1 h-12">
        <div className="flex-1 flex items-center gap-3">
          {isEditorInline && isUpdating ? (
            renderEditor({
              isOpen: isUpdating,
              onClose: () => setIsUpdating(false),
            })
          ) : (
            <DisplayEntity id={id} label={label} icon={icon} />
          )}
        </div>

        {isLoading ? (
          <span className="p-1 inline-flex text-accent">
            <Spinner size={20} />
          </span>
        ) : (
          <button
            onClick={() => setIsUpdating(!isUpdating)}
            aria-label={isUpdating ? "Cancel" : "Edit"}
            className="p-1 rounded text-accent hover:text-accent-strong"
          >
            {isUpdating ? <Cancel size={20} /> : <Edit size={20} />}
          </button>
        )}
      </div>
      {!isEditorInline &&
        renderEditor({
          isOpen: isUpdating,
          onClose: () => setIsUpdating(false),
        })}
    </>
  );
}

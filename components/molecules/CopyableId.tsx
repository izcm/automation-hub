import { Copyable } from "@a2zb/react";
import { Copy } from "@components/icons";

function truncateId(id: string, length = 8) {
  return id.length > length ? `${id.slice(0, length)}...` : id;
}

export function CopyableId({ id }: { id: string }) {
  return (
    <Copyable className="text-subtle no-underline" value={id}>
      <span className="inline-flex">
        <span>{truncateId(id)}</span>
        <Copy size={14} />
      </span>
    </Copyable>
  );
}

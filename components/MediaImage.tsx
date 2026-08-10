import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  size?: number;
};

// Default media for a SimpleRow: a square, rounded image.
export function MediaImage({ src, alt = "", size = 64 }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded object-cover"
    />
  );
}

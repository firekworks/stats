import Image from "next/image";

export function FirekworksMark({ className = "" }: { className?: string }) {
  return (
    <span className={`firekworks-mark ${className}`.trim()} aria-hidden="true">
      <Image src="/brand/firekworks-icon.png" alt="" width={64} height={64} />
    </span>
  );
}

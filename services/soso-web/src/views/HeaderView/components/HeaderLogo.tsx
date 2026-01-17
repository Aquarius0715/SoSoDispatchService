import Link from "next/link";
import { cn } from "@/lib/utils";

type HeaderLogoProps = {
  href?: string;
  className?: string;
};

export function HeaderLogo({
  href = "/",
  className,
}: HeaderLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-2xl font-semibold tracking-tight",
        "cursor-pointer",
        "hover:opacity-80 transition-opacity",
        className
      )}
    >
      SOSo
    </Link>
  );
}

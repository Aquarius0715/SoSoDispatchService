import { PropsWithChildren } from "react";
import HeaderView from "@/views/HeaderView/HeaderView";

export function CalendersLayout({ children }: PropsWithChildren) {
  return (
    <>
      <HeaderView />
      <main className="px-4 py-4 md:px-6">{children}</main>
    </>
  );
}

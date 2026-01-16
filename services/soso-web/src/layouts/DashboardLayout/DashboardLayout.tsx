import { PropsWithChildren } from "react";
import HeaderView from "@/views/HeaderView/HeaderView";

type Props = PropsWithChildren & {
  calendarName?: string;
};

export function DashboardLayout({ children, calendarName = "テニスサークル" }: Props) {
  return (
    <>
      <HeaderView calendarName={calendarName} showShare />
      <main className="px-4 py-4 md:px-6">{children}</main>
    </>
  );
}

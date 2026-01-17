import { PropsWithChildren } from "react";
import HeaderView from "@/views/HeaderView/HeaderView";
import { RequireAuth } from "@/lib/auth/RequireAuth";

type Props = PropsWithChildren & {
  calendarName?: string;
};

export function DashboardLayout({ children, calendarName }: Props) {
  return (
    <RequireAuth>
      <>
        <HeaderView/>
        <main className="px-4 py-4 md:px-6">{children}</main>
      </>
    </RequireAuth>
  );
}

// services/soso-web/src/app/calendars/invite/page.tsx
import { redirect } from "next/navigation";

type Props = {
  searchParams?: { calenderId?: string };
};

export default function CalendarInviteRedirectPage({ searchParams }: Props) {
  const calenderId = searchParams?.calenderId;

  if (typeof calenderId === "string" && calenderId.trim()) {
    redirect(`/calendars?calenderId=${encodeURIComponent(calenderId)}`);
  }

  redirect("/calendars");
}
// services/soso-web/src/app/calenders/invite/page.tsx
import { redirect } from "next/navigation";

type Props = {
  searchParams?: { calenderId?: string };
};

export default function CalenderInviteRedirectPage({ searchParams }: Props) {
  const calenderId = searchParams?.calenderId;

  if (typeof calenderId === "string" && calenderId.trim()) {
    redirect(`/calenders?calenderId=${encodeURIComponent(calenderId)}`);
  }

  redirect("/calenders");
}
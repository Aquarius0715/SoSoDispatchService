"use client";

import React from "react";
import { useParams } from "next/navigation";

import CalendarsSidebarView from "./CalendarListSidebarView/CalendarsSidebarView";
import { CalendarDetailSidebarView } from "./CalendarDetailSidebarView/CalendarDetailSidebarView";

export default function CalendarsSidebarSwitch() {
  const params = useParams();

  const id =
    params && typeof (params as any).id === "string"
      ? ((params as any).id as string)
      : params && typeof (params as any).calendarId === "string"
        ? ((params as any).calendarId as string)
        : null;

  return id ? <CalendarDetailSidebarView calendarId={id} /> : <CalendarsSidebarView />;
}

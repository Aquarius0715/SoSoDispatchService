"use client";

import React from "react";
import { useParams } from "next/navigation";

import CalendersSidebarView from "./CalenderListSidebarView/CalendersSidebarView";
import { CalenderDetailSidebarView } from "./CalenderDetailSidebarView/CalenderDetailSidebarView";

export default function CalendersSidebarSwitch() {
  const params = useParams();

  const id =
    params && typeof (params as any).id === "string"
      ? ((params as any).id as string)
      : params && typeof (params as any).calenderId === "string"
        ? ((params as any).calenderId as string)
        : null;

  return id ? <CalenderDetailSidebarView calenderId={id} /> : <CalendersSidebarView />;
}

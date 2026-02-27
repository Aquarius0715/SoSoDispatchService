// src/views/HeaderView/components/HeaderCenterLogo.tsx
"use client";

import React from "react";
import { HeaderLogo } from "./HeaderLogo";

export function HeaderCenterLogo() {
  return (
    <div className="flex-1 md:flex-none">
      <div className="relative flex w-full items-center justify-center md:justify-start">
        <div className="md:static md:translate-x-0">
          <HeaderLogo />
        </div>
      </div>
    </div>
  );
}

// src/views/HeaderView/components/HeaderAccountSection.tsx
"use client";

import React from "react";
import { AccountMenu } from "./AccountMenu";

export function HeaderAccountSection() {
  return (
    <div className="ml-auto flex items-center">
      <div className="md:hidden">
        <AccountMenu compact />
      </div>
      <div className="hidden md:block">
        <AccountMenu />
      </div>
    </div>
  );
}

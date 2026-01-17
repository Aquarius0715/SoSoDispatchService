// src/components/ui/snackbar.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SnackbarVariant = "success" | "error" | "info";

type SnackbarItem = {
  id: number;
  message: string;
  variant: SnackbarVariant;
  durationMs?: number;
};

type SnackbarContextValue = {
  showSnackbar: (
    message: string,
    variant?: SnackbarVariant,
    durationMs?: number,
  ) => void;
};

const SnackbarContext =
  React.createContext<SnackbarContextValue | undefined>(undefined);

export function useSnackbar(): SnackbarContextValue {
  const ctx = React.useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return ctx;
}

// 1つのスナックバー表示コンポーネント（右からにゅっとアニメーション＋フェードアウト）
const SnackbarItemView: React.FC<{
  item: SnackbarItem;
  onRemove: (id: number) => void;
}> = ({ item, onRemove }) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const duration = item.durationMs ?? 5000;
    const transitionMs = 300; // CSS の duration-300 に合わせる

    // マウント直後に表示して「にゅっ」と出す
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // 一定時間後に visible=false にしてフェードアウト開始
    const exitTimer = setTimeout(() => {
      setVisible(false);
    }, duration);

    // フェードアウトが終わったくらいのタイミングで実際に削除
    const removeTimer = setTimeout(() => {
      onRemove(item.id);
    }, duration + transitionMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [item.id, item.durationMs, onRemove]);

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-md",
        "bg-slate-900/90 text-slate-50",
        // 右からスライドイン + フェードイン / アウト
        "transform transition-all duration-300",
        "translate-x-full opacity-0",
        visible && "translate-x-0 opacity-100",
        item.variant === "success" && "border-emerald-400",
        item.variant === "error" && "border-red-400",
        item.variant === "info" && "border-slate-500",
      )}
    >
      {item.message}
    </div>
  );
};

export const SnackbarProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [items, setItems] = React.useState<SnackbarItem[]>([]);

  const showSnackbar = React.useCallback(
    (
      message: string,
      variant: SnackbarVariant = "info",
      durationMs = 5000,
    ) => {
      const id = Date.now() + Math.random();

      setItems((prev) => {
        const last = prev[prev.length - 1];

        // ★ 直前のスナックバーと message & variant が同じなら追加しない
        if (last && last.message === message && last.variant === variant) {
          return prev;
        }

        return [...prev, { id, message, variant, durationMs }];
      });
    },
    [],
  );

  const handleRemove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {/* 右上固定・下方向に積み上がるレイアウト */}
      <div className="pointer-events-none fixed top-[72px] right-4 z-50 flex flex-col items-end gap-2">
        {items.map((item) => (
          <SnackbarItemView
            key={item.id}
            item={item}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

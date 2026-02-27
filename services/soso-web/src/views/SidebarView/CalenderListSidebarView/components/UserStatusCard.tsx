"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { StatusEditDialog } from "./StatusEditDialogView/StatusEditDialogView";
import { useAuthState } from "@/contexts/AuthContext";

export function UserStatusCard() {
  const { user, isLoading } = useAuthState();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">ユーザーステータス</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {isLoading && <div className="text-slate-500">読み込み中...</div>}

        {!isLoading && !user && (
          <div className="text-slate-500">ユーザー情報を取得できません</div>
        )}

        {user && (
          <>
            <div>
              <div className="text-slate-500">ユーザー名</div>
              <div className="font-medium">{user.username}</div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-slate-500">車の有無</div>
                <div className="font-medium">{user.hasCar ? "あり" : "なし"}</div>
              </div>

              <div>
                <div className="text-slate-500">最大乗車人数</div>
                <div className="font-medium">
                    {user.hasCar ? `${user.capacity}人` : "—"}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOpen(true)}
            >
              ステータスの編集
            </Button>

            <StatusEditDialog open={open} onOpenChange={setOpen} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

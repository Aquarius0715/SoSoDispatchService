import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">お探しのページが見つかりませんでした</CardTitle>
          <CardDescription>
            権限がない操作、または存在しないリソースにアクセスした可能性があります。
          </CardDescription>
        </CardHeader>

        <CardContent className="text-sm leading-6 text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>URL が正しいか確認してください。</li>
            <li>管理者権限が必要な操作の場合、管理者に確認してください。</li>
          </ul>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/calenders">カレンダーへ戻る</Link>
          </Button>
          <Button asChild>
            <Link href="/">トップへ</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

import Link from "next/link";

type Props = {
  searchParams?: { next?: string };
};

export default function TokenExpiredPage({ searchParams }: Props) {
  const next = searchParams?.next ?? "/";

  return (
    <div className="flex w-full flex-col items-center justify-center text-center gap-4 px-6">
      <h1 className="text-xl font-semibold tracking-tight">
        セッションの有効期限が切れました
      </h1>

      <p className="text-sm leading-6 text-muted-foreground">
        お手数ですが再度ログインしてください。
      </p>

      <Link
        href={`/auth/login?next=${encodeURIComponent(next)}`}
        className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        ログイン画面へ
      </Link>
    </div>
  );
}

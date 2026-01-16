import "./globals.css";
import type { Metadata } from "next";
import { SnackbarProvider } from "@/components/ui/snackbar";

export const metadata: Metadata = {
  title: "SOSO",
  description: "SoSo dispatch app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Say Something",
  description: "Fun conversation topics, get to know your friends or colleagues better.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-linear-to-b from-violet-100/40 via-fuchsia-50/30 to-amber-100/50">{children}</body>
    </html>
  );
}

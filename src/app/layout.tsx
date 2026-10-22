import type { Metadata } from "next";
import { Figtree, Nunito } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Say Something",
  description: "Fun conversation topics, get to know your friends or colleagues better.",
  openGraph: {
    title: "Say Something",
    description:
      "Fun conversation topics, get to know your friends or colleagues better.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Say Something" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Say Something",
    description:
      "Fun conversation topics, get to know your friends or colleagues better.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-linear-to-b from-violet-100/40 via-fuchsia-50/30 to-amber-100/50">{children}</body>
    </html>
  );
}

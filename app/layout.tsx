import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "roster — The self-learning tool router for MCP",
  description:
    "Roster finds the right tools when needed, learns from what works, and works with any MCP client.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}

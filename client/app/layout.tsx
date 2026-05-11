import type { Metadata } from "next";
import "@/app/globals.css";

import UserNavbar from "@/components/layout/UserNavbar";

export const metadata: Metadata = {
  title: "KanKluay Shopping",
  description: "E-Commerce platform for shopping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}

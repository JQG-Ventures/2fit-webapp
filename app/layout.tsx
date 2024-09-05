import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers as AuthProvider } from "@/providers/authProvider";

import "./globals.css";
import "./_css/base.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Fit AI",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}

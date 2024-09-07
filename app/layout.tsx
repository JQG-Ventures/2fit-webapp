import "./globals.css";
import "./_css/base.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RegisterProvider } from './_components/register/RegisterProvider';
import NavBar from "./_components/navbar/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Fit App",
  description: "Embark into your new fitness destiny",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <RegisterProvider>
        <body className={inter.className} style={{ paddingTop: '64px' }}>
          {children}
          <NavBar />
        </body>
      </RegisterProvider>
    </html>
  );
}

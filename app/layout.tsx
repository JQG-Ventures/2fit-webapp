import "./globals.css";
import "./_css/base.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RegisterProvider } from "./_components/register/RegisterProvider";
import { default as AuthProvider } from "./_providers/AuthProvider";
import NavBar from "./_components/navbar/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Fit App",
  description: "Embark on your new fitness journey",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600&display=swap"></link>
      </head>
      <body className={inter.className}>
        <RegisterProvider>
          <AuthProvider>
              {children}
          </AuthProvider>
          <NavBar />
        </RegisterProvider>
      </body>
    </html>
  );
}

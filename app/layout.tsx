import "./globals.css";
import "./_css/base.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RegisterProvider } from './_components/register/RegisterProvider';
import NavBar from "./_components/navbar/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Fit App",
  description: "Embark on your new fitness journey",
  // Additional meta tags can be added here
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        {/* Additional head elements */}
      </head>
      <body id="test" className={inter.className}>
        <RegisterProvider>
          <div>
            {children}
          </div>  
          <NavBar />
        </RegisterProvider>
      </body>
    </html>
  );
}

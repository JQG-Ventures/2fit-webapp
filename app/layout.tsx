"use client"; // Asegúrate de agregar esta línea

import "./globals.css";
import "./_css/base.css";
import { Inter } from "next/font/google";
import { RegisterProvider } from './_components/register/RegisterProvider';
import NavBar from "./_components/navbar/NavBar";
import { LanguageProvider } from './utils/LanguageContext'; // Asegúrate de la ruta correcta
import { ReactNode } from "react"; 
import '@/app/utils/i18n'; // Importa la configuración de i18next

const inter = Inter({ subsets: ["latin"] });

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600&display=swap"></link>
      </head>
      <body id="test" className={inter.className}>
        <LanguageProvider>
          <RegisterProvider>
            <div>
              {children}
            </div>  
            <NavBar />
          </RegisterProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

export default RootLayout; // Sin appWithTranslation

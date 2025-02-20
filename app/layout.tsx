"use client";

import "./globals.css";
import "./_css/base.css";
import { Inter } from "next/font/google";
import { RegisterProvider } from "./_components/register/RegisterProvider";
import { default as AuthProvider } from "./_providers/AuthProvider";
import NavBar from "./_components/navbar/NavBar";
import { LanguageProvider } from "./utils/LanguageContext";
import { ReactNode } from "react";
import "@/app/utils/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingProvider, useLoading } from "./_providers/LoadingProvider";
import LoadingScreen from "./_components/animations/LoadingScreen";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const LayoutContent = ({ children }: { children: ReactNode }) => {
	const { isLoading } = useLoading();
	const pathname = usePathname();
    const { data: session, status } = useSession();

	const hideNavBarPaths = ['/login', '/re-auth', '/register', '/login/google']
	// @ts-nocheck
    const shouldShowNavBar = window.location.pathname !== '/' && !hideNavBarPaths.includes(pathname) && status === "authenticated";


	return (
		<>
			{shouldShowNavBar && <NavBar />}
			{isLoading && <LoadingScreen />}
			<AnimatePresence mode="wait">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.5 }}
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</>
	);
};

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
						<AuthProvider>
							<LoadingProvider>
								<LayoutContent>{children}</LayoutContent>
							</LoadingProvider>
						</AuthProvider>
					</RegisterProvider>
				</LanguageProvider>
			</body>
		</html>
	);
};

export default RootLayout;

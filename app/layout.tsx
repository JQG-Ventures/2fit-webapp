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
import { SessionProvider as CustomSessionProvider } from "./_providers/SessionProvider";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingProvider, useLoading } from "./_providers/LoadingProvider";
import LoadingScreen from "./_components/animations/LoadingScreen";

const inter = Inter({ subsets: ["latin"] });

const LayoutContent = ({ children }: { children: ReactNode }) => {
	const { isLoading } = useLoading();
		
	return (
		<>
			<NavBar />
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
							<CustomSessionProvider>
								<LoadingProvider>
									<LayoutContent>{children}</LayoutContent>
								</LoadingProvider>
							</CustomSessionProvider>
						</AuthProvider>
					</RegisterProvider>
				</LanguageProvider>
			</body>
		</html>
	);
};

export default RootLayout;

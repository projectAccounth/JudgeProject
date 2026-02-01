import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/app/components/TopBar";
import Footer from "@/app/components/Footer";
import { I18nProvider } from "@/app/components/I18nProvider";
import { AuthProvider } from "@/app/context/AuthContext";
import { BackendStatusWarning } from "@/app/components/BackendStatusWarning";

export const metadata: Metadata = {
    title: "CodeFix AI - Online Judge Platform",
    description: "Practice competitive programming with an online judge platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider>
                    <I18nProvider>
                        <TopBar />
                        <BackendStatusWarning />
                        {children}
                        <Footer />
                    </I18nProvider>
                </AuthProvider>
            </body>
        </html>
    );
}


import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "DuitKu — Personal Finance Dashboard",
    description: "Kelola keuangan pribadi lo dengan mudah dan visual yang kece",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id" suppressHydrationWarning>
            <body>
                <ThemeProvider>
                    <div className="app-shell">
                        <Sidebar />
                        <main className="main-content">{children}</main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}

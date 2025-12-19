import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import StreakTracker from "./components/StreakTracker";
import PWASplashScreen from "./components/PWASplashScreen";
import { Toaster } from "sonner";
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pocketly - Expense Tracker",
  description: "Track your expenses and manage your pockets",
  manifest: "/manifest.json",
  themeColor: "#18181b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pocketly",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <AppProvider>
            <PWASplashScreen duration={2000} />
            <StreakTracker />
            {children}
            <PWAInstallPrompt />
          </AppProvider>
        </Providers>
        <Toaster position="top-right" richColors={false} />
        <Analytics />
      </body>
    </html>
  );
}

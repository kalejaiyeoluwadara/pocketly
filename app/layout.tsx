import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import StreakTracker from "./components/StreakTracker";
import PWASplashScreen from "./components/PWASplashScreen";
import { Toaster } from "sonner";
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pocketly - Expense Tracker",
  description: "Track your expenses and manage your pockets",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0d" },
  ],
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
      <body className={`${bricolage.variable} ${instrument.variable} antialiased`}>
        <Providers>
          <AppProvider>
            <PWASplashScreen duration={2000} />
            <StreakTracker />
            {children}
            <PWAInstallPrompt />
          </AppProvider>
        </Providers>
        <Toaster
          position="bottom-center"
          richColors={false}
          toastOptions={{
            classNames: {
              toast:
                "!rounded-xl !border-zinc-200 !bg-white !text-zinc-900 !shadow-elevated-lg dark:!border-zinc-800 dark:!bg-zinc-900 dark:!text-zinc-50",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}

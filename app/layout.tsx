import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UnitsProvider } from "@/lib/units";
import SWRegister from "@/components/SWRegister";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeatherScope · Make weather data work for you",
  description:
    "Live conditions, hourly + 7-day forecast, air quality, and a smart day brief for anywhere on Earth. Built by Ronit Jitesh for the PM Accelerator AI Engineer assessment.",
  manifest: "/manifest.webmanifest",
  applicationName: "WeatherScope",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "WeatherScope" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UnitsProvider>{children}</UnitsProvider>
        <SWRegister />
      </body>
    </html>
  );
}

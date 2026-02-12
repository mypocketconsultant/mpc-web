import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lato, Raleway } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  display: "swap",
  variable: "--font-clash-display",
});

const railway = Raleway({
  variable: "--font-railway",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#5A3FFF",
};

export const metadata: Metadata = {
  title: {
    default: "MPC - Intelligent Counsel, Anytime, Anywhere",
    template: "%s | MPC",
  },
  description:
    "Your AI-powered personal companion for career growth, life planning, and well-being. Get intelligent counsel anytime, anywhere with MPC.",
  keywords: [
    "AI assistant",
    "career planning",
    "life coach",
    "resume builder",
    "personal development",
    "mood tracking",
    "goal setting",
    "AI counselor",
  ],
  authors: [{ name: "MPC Team" }],
  creator: "MPC",
  publisher: "MPC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mpc.app",
    siteName: "MPC",
    title: "MPC - Intelligent Counsel, Anytime, Anywhere",
    description:
      "Your AI-powered personal companion for career growth, life planning, and well-being.",
    images: [
      {
        url: "/logo.svg",
        width: 299,
        height: 299,
        alt: "MPC Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MPC - Intelligent Counsel, Anytime, Anywhere",
    description:
      "Your AI-powered personal companion for career growth, life planning, and well-being.",
    images: ["/logo.svg"],
    creator: "@mpc",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={railway.variable}>
      <body className={`${railway.className} antialiased`}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Baloo_Bhai_2, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth";
import { CivilAIAssistantModal } from "../components/ai/CivilAIAssistantModal";

const balooBhai2 = Baloo_Bhai_2({
  variable: "--font-baloo-bhai-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MatelBuild | Smart Construction Estimator & SaaS Dashboard",
  description: "Next-gen civil engineering material & cost estimation operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${balooBhai2.variable} ${ibmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--cream)] text-[var(--ink)] transition-colors duration-300">
        <AuthProvider>
          {children}
          <CivilAIAssistantModal />
        </AuthProvider>
      </body>
    </html>
  );
}

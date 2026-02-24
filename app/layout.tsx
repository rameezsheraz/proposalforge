import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ProposalForge.io – Upwork Proposal Optimizer for Tech Freelancers",
  description:
    "Stop losing jobs to generic proposals. Win more QA, BA, PO, PM, Dev & DevOps gigs with AI-optimized Upwork proposals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}

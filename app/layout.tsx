import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'EBC - Electric Bill Calculator | Real-Time Energy Cost & Tariff Simulator',
  description: 'Calculate, analyze, and optimize your electric bill with real-time reactive calculations, tiered tariff modeling, appliance breakdown, and downloadable PDF reports.',
  openGraph: {
    title: 'EBC - Electric Bill Calculator',
    description: 'High-performance real-time electricity bill estimation and tariff audit generator.',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

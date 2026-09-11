import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { fontVariables } from "./fonts";
import { siteMetadata, siteViewport } from "./metadata";

export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} antialiased`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

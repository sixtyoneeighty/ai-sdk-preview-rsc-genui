import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/error-boundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-rsc-genui.vercel.dev"),
  title: "PunkBot - Your Snarky Punk Rock AI Assistant",
  description: "A punk rock AI assistant with attitude and real-time fact-checking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" richColors />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

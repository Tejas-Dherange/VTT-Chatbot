import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar/page";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VTT Chatbot - AI Assistant for Courses.",
  description: "Chat with your video transcript content using AI. Upload VTT files and get intelligent responses about your video content.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider organizationId={null}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

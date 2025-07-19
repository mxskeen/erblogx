import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { AppSidebar } from "./_components/AppSidebar"
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import Header from "./_components/Header";
import FloatingDock from "../components/ui/FloatingDock";
import { Compass, GalleryHorizontalEnd, Home as HomeIcon } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ErBlogX - AI-Powered Engineering Blog Search",
  description: "Search over 16,000+ engineering blogs and articles from 600+ sources with AI-powered semantic search. Get instant summaries and discover the best technical content.",
  keywords: "engineering blogs, technical articles, AI search, software engineering, programming, technology",
  authors: [{ name: "maskeen" }],
  creator: "maskeen",
  openGraph: {
    title: "ErBlogX - AI-Powered Engineering Blog Search",
    description: "Search over 16,000+ engineering blogs with AI-powered semantic search",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ErBlogX - AI-Powered Engineering Blog Search",
    description: "Search over 16,000+ engineering blogs with AI-powered semantic search",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            baseTheme: undefined,
          }}
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <Provider>
              {children}
              <Header />
              {/* Floating Dock for Home, Discovery & Library */}
              <FloatingDock
                items={[
                  {
                    title: "Home",
                    icon: <HomeIcon className="h-full w-full" />,
                    href: "/",
                  },
                  {
                    title: "Discovery",
                    icon: <Compass className="h-full w-full" />,
                    href: "/discover",
                  },
                  {
                    title: "Library",
                    icon: <GalleryHorizontalEnd className="h-full w-full" />,
                    href: "/lib",
                  },
                ]}
              />
            </Provider>
          </SidebarProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

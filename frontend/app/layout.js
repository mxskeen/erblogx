import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";

export const metadata = {
  title: "ErBlogX — The Index for Everything Engineering",
  description: "An architectural index of 25,000+ engineering dispatches from the world's most demanding engineering organizations.",
  keywords: "engineering blogs, system design, distributed systems, architecture, postmortems, consensus, eBPF, databases",
  authors: [{ name: "maskeen" }],
  creator: "maskeen",
  openGraph: {
    title: "ErBlogX — The Index for Everything Engineering",
    description: "High-signal engineering dispatches from Netflix, Stripe, Cloudflare, Figma, and 600+ teams.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ErBlogX — The Index for Everything Engineering",
    description: "High-signal engineering dispatches from Netflix, Stripe, Cloudflare, Figma, and 600+ teams.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Inter:wght@300;400;450;500;600&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FBFBF9] text-[#18181B] selection:bg-zinc-900 selection:text-white min-h-screen">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <Provider>
            {children}
          </Provider>
        </ClerkProvider>
      </body>
    </html>
  );
}

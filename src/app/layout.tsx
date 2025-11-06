import { Inter, Lora } from "next/font/google"
import NextTopLoader from "nextjs-toploader"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ReactQueryProvider } from "@/components/providers/query-provider"
import ThemeProvider from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-lora",
  display: "swap",
})

export const metadata = {
  title: "Pica Bot | AI ERP Assistant",
  description:
    "Pica Bot is an intelligent AI assistant that integrates with your ERP POS system to enhance customer support. It provides real-time chat, product recommendations, and multilingual capabilities for medical and supplement sales teams.",
  keywords: [
    "Pica Bot",
    "ERP Assistant",
    "AI Chatbot",
    "POS Integration",
    "Customer Support AI",
    "Multilingual ERP Chat",
    "Medical Product Assistant",
    "Sales Automation",
  ],
  authors: [{ name: "Htet Aung Lin", url: "https://htetaunglin-coder.vercel.app" }],
  creator: "Htet Aung Lin",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={`${inter.variable} ${lora.variable}`}>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="manifest" href="/favicon/site.webmanifest" />

      <body className="font-inter">
        <ReactQueryProvider>
          <ThemeProvider>
            <TooltipProvider delayDuration={200} skipDelayDuration={0} disableHoverableContent={false}>
              <NextTopLoader color={`hsl(var(--mijnui-primary))`} showSpinner={false} easing="ease" zIndex={9999} />
              {/* Temporary 10s toast for testing purposes during MVP Phase */}
              <Toaster richColors duration={10000} />
              {children}

              <ConfirmationDialog />
            </TooltipProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

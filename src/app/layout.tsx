import '../ds/styles/index.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { AppChrome, NextAuthProvider, ThemeInitScript, ThemeProvider } from '@/ds'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Solar Match - Solar Lead Generation',
  description: 'Connect homeowners with solar installers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <NextAuthProvider>
          <ThemeProvider>
            <AppChrome>{children}</AppChrome>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}

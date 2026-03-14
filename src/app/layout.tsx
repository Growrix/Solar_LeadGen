import '../ds/styles/index.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { AppChrome, NextAuthProvider, ThemeInitScript, ThemeProvider } from '@/ds'
import { PlatformPresetScript } from '@/ds/runtime/app/PlatformPresetScript'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <ThemeInitScript />
        <PlatformPresetScript />
      </head>
      <body className={inter.className}>
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

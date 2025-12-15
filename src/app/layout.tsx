import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../components/ThemeProvider'
import LayoutContent from '../components/LayoutContent'
import NextAuthProvider from '../components/NextAuthProvider'
import { Toaster } from 'sonner'

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
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider>
            <LayoutContent>{children}</LayoutContent>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}

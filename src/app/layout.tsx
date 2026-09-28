import React from 'react'
import { Viewport } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import '../styles.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { ModeToggle } from '../components/ModeToggle'
import FileBurgerQueryClientProvider from '../components/QueryClientProvider'
import Footer from '../components/Footer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://file.burger'

export const metadata = {
  title: 'FileBurger — Your files, delivered hot.',
  description:
    'Free peer-to-peer file transfers in your web browser. No upload step, no server storage, no waiting.',
  charSet: 'utf-8',
  openGraph: {
    url: SITE_URL,
    title: 'FileBurger — Your files, delivered hot.',
    description: 'Free peer-to-peer file transfers in your web browser.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf7ec' },
    { media: '(prefers-color-scheme: dark)', color: '#17120f' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <FileBurgerQueryClientProvider>
              <main>{children}</main>
              <Footer />
              <ModeToggle />
            </FileBurgerQueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'Trimly - URL Shortener',
  description: 'Shorten, track, and manage your URLs with ease',
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

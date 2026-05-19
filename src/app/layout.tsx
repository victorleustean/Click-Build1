import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { roRO } from '@clerk/localizations'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = { title: 'Click && Build' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={roRO}>
      <html lang="ro">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
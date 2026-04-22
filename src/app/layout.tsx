import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StingyMarket - Your Daily Grocery',
  description: 'Online grocery store delivering fresh products to your doorstep',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
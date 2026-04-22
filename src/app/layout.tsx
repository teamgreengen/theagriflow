import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgriFlow - Premium Fresh Produce',
  description: 'Farm-fresh groceries delivered with gold-standard quality.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
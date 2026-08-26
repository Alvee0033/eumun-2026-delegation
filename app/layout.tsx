import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EUMUN 2026 — Delegate Registration | Campus Envoy Syed Saimum Hasan',
  description:
    'Official delegate registration for EUMUN 2026. Join aspiring diplomats for engaging debate, collaboration, and diplomacy.',
  openGraph: {
    title: 'EUMUN 2026 — Delegate Registration',
    description: 'Register now for EUMUN 2026 — Official Campus Envoy Delegation Portal.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080c14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-[#080c14] text-slate-100">
      <body className="bg-[#080c14] min-h-screen text-slate-100">{children}</body>
    </html>
  )
}

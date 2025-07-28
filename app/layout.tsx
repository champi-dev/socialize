import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Socialize - Connect with Friends',
  description: 'A modern social networking platform where you can connect, share, and engage with your community. Join today to start building meaningful connections.',
  keywords: 'social network, connect, friends, community, share, social media',
  authors: [{ name: 'Socialize Team' }],
  creator: 'Socialize',
  publisher: 'Socialize',
  openGraph: {
    title: 'Socialize - Connect with Friends',
    description: 'A modern social networking platform where you can connect, share, and engage with your community.',
    url: 'https://socialize-virid-six.vercel.app',
    siteName: 'Socialize',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Socialize - Social Networking Platform'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Socialize - Connect with Friends',
    description: 'A modern social networking platform where you can connect, share, and engage with your community.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
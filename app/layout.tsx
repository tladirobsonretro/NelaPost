import './globals.css'
import type { Metadata } from 'next'

const siteUrl = 'https://nelapost.onrender.com'
const siteTitle = 'NelaPost | Practical Tools to Help You Grow'
const siteDescription = 'Free, practical tools to help you build your CV, manage your business and plan your content. One place to get things done and move forward.'

export const metadata: Metadata = {
 metadataBase: new URL(siteUrl),
 title: siteTitle,
 description: siteDescription,
 applicationName: 'NelaPost',
 icons: {
  icon: [{ url: '/logo-mark.svg', type: 'image/svg+xml' }],
  shortcut: ['/logo-mark.svg'],
 },
 openGraph: {
  type: 'website',
  url: siteUrl,
  siteName: 'NelaPost',
  title: siteTitle,
  description: siteDescription,
  images: [{
   url: '/opengraph-image',
   width: 1200,
   height: 630,
   alt: 'NelaPost: practical tools to help you grow',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: siteTitle,
  description: siteDescription,
  images: ['/opengraph-image'],
 },
}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>
}

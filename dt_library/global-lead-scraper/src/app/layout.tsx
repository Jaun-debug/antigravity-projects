
import './globals.css'
export const metadata = {
  title: 'Global Lead Scraper',
  description: 'Advanced Sales Machine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

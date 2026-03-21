import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'sats.fast — your personal Bitcoin financial agent',
  description:
    'Install your self-custodial Bitcoin agent in one command. Claim a lightning address. Send and receive bitcoin and USDT by just talking to your wallet.',
  keywords: ['bitcoin', 'lightning', 'spark', 'liquid', 'USDT', 'self-custodial', 'telegram', 'wallet'],
  openGraph: {
    title: 'sats.fast',
    description: 'Your personal Bitcoin financial agent',
    url: 'https://sats.fast',
    siteName: 'sats.fast',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'sats.fast',
    description: 'Your personal Bitcoin financial agent',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

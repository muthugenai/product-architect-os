import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Product Architect OS',
  description: 'Strategy. Design. Code.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Muthukumar Rajamani',
  description:
    'Leading design at Atlassian and building at the intersection of AI and Product Architecture.',
  openGraph: {
    title: 'The Ambidextrous Leader: Management + Super IC',
    description: "How I'm leveraging Next.js 15 and Cursor to lead with technical agency.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.className} min-h-screen bg-black text-zinc-50 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer id="about" className="border-t border-zinc-800 bg-zinc-950/80">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between md:px-10">
              <p>Built with Cursor + Vercel</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/in/muthukumar-rajamani"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-zinc-200"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/muthugenai/product-architect-os"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-zinc-200"
                >
                  Product Architect OS
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

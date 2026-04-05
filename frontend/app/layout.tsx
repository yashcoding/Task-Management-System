import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'TaskFlow — Task Management',
  description: 'Manage your tasks efficiently',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-white font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#22222e',
              color: '#e8e6f0',
              border: '1px solid #2e2e3e',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-dm-sans)',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0f2e1a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#2d1a1a' } },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TCET Lab Lending — Laboratory Equipment Management System',
  description:
    'Institutional laboratory equipment inventory, real-time availability tracking, and lending platform for Thakur College of Engineering and Technology (TCET), Mumbai.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <head>
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}

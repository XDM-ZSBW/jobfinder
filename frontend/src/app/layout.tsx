import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../../styles/agent-ui.css'; // Agent UI component styles

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JobMatch AI - Connect with Real Opportunities',
  description: 'AI-powered platform connecting job seekers directly with hiring managers',
  icons: {
    icon: '/favicon.svg',
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
        {/* Suppress React DevTools message in development */}
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {};
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

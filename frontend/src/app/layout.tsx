import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { themeScript } from '@/components/theme/theme-script';
import { ToastProvider } from '@/components/ui/toast';
import { SkipLink } from '@/components/site/skip-link';
import './globals.css';

const display = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SWARM — Deploy a swarm. Watch it think.',
    template: '%s · SWARM',
  },
  description:
    'SWARM is a mission-control workbench for coordinating AI agents: live reasoning streams, telemetry, knowledge graphs and final reports.',
  metadataBase: new URL('https://swarm-web-two.vercel.app'),
  openGraph: {
    title: 'SWARM — Deploy a swarm. Watch it think.',
    description:
      'A mission-control workbench for AI agent swarms: live reasoning streams, telemetry, knowledge graphs and final reports.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2eff0' },
    { media: '(prefers-color-scheme: dark)', color: '#191716' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SkipLink />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
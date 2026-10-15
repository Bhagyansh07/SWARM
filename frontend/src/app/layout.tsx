import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { themeScript } from '@/components/theme/theme-script';
import { ToastProvider } from '@/components/ui/toast';
import { SkipLink } from '@/components/site/skip-link';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import './globals.css';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SWARM — Autonomous Multi-Agent Synthesis Workbench',
    template: '%s · SWARM Intelligence',
  },
  description:
    'Enterprise orchestration platform for autonomous AI agent collectives. Continuous live reasoning streams, adversarial red-teaming, knowledge graph extraction, and audit-grade verdicts.',
  metadataBase: new URL('https://swarm-web-two.vercel.app'),
  openGraph: {
    title: 'SWARM — Autonomous Multi-Agent Synthesis Workbench',
    description:
      'Orchestrate specialized AI agent collectives to dissect complex briefs, stress-test hypotheses, and converge on audit-grade decisions in real time.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#080a0f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body className="flex min-h-screen flex-col font-display antialiased">
        <ThemeProvider>
          <ToastProvider>
            <SkipLink />
            <Topbar />
            <div className="flex-1 animate-in fade-in-up">{children}</div>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { themeScript } from '@/components/theme/theme-script';
import { ToastProvider } from '@/components/ui/toast';
import { SkipLink } from '@/components/site/skip-link';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import './globals.css';

// Both faces are vendored rather than fetched through next/font/google.
//
// next/font/google downloads the files at build time, which made every build
// depend on fonts.googleapis.com answering. When that call flaked the build
// failed with a TypeError from the loader, not a font problem - it took a
// re-run to pass. The two files below are the same latin variable fonts
// Google served for this exact request, saved in the repository.
//
// Nothing changes at runtime either way: next/font self-hosts what it loads
// and serves it from /_next/static, so the bytes on the wire are the same.
// The difference is that the build no longer reaches out to a third party.

const display = localFont({
  src: './fonts/plus-jakarta-sans-latin.woff2',
  weight: '400 800',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
});

const mono = localFont({
  src: './fonts/jetbrains-mono-latin.woff2',
  weight: '400 700',
  style: 'normal',
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
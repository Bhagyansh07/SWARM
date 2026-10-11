import Link from 'next/link';
import { GlyphPulse } from '@/components/glyphs';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';

export default function NotFound() {
  return (
    <div className="bg-grid flex min-h-screen flex-col">
      <Topbar />
      <main id="main" className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center gap-5 px-5 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center border border-[var(--line-strong)] bg-[var(--paper-2)] text-[var(--faint)]">
          <GlyphPulse width={24} height={24} />
        </div>
        <p className="rack-index m-0">signal lost / 404</p>
        <h1 className="font-display m-0 text-[30px] font-black uppercase tracking-[0.04em] text-[var(--ink)]">
          No mission on this channel
        </h1>
        <p className="m-0 max-w-[40ch] text-[14px] leading-relaxed text-[var(--dim)]">
          The route you dialled does not exist — a deleted mission, a stale share link, or a typo in the coordinates.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="key px-5 py-2.5 text-[12px] no-underline">
            Back to HQ
          </Link>
          <Link href="/history" className="ghost px-5 py-2.5 text-[12px] no-underline">
            Run library
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
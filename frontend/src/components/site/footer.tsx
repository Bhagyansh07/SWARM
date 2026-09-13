import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display m-0 text-[13px] font-black uppercase tracking-[0.22em] text-[var(--ink)]">SWARM</p>
          <p className="font-mono m-0 mt-1 text-[10.5px] uppercase tracking-[0.14em] text-[var(--faint)]">
            mission-control workbench for AI agent swarms
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-l border-[var(--line-strong)] pl-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--dim)]">
          <Link href="/builder" className="no-underline underline-offset-4 hover:text-[var(--signal)] hover:underline">
            Workflow builder
          </Link>
          <Link href="/history" className="no-underline underline-offset-4 hover:text-[var(--signal)] hover:underline">
            Run library
          </Link>
          <a href="https://groq.com" target="_blank" rel="noreferrer" className="no-underline underline-offset-4 hover:text-[var(--signal)] hover:underline">
            Groq free tier
          </a>
        </nav>
      </div>
    </footer>
  );
}
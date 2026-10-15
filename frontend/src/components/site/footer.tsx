import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--line)] bg-[var(--paper-2)]/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--paper-3)] border border-[var(--line-strong)] text-[var(--ink)]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="5" cy="5" r="2" />
                <circle cx="19" cy="5" r="2" />
                <circle cx="5" cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
              </svg>
            </span>
            <p className="font-display m-0 text-[14px] font-bold tracking-tight text-[var(--ink)]">
              SWARM
            </p>
          </div>
          <p className="m-0 mt-1.5 text-[12px] text-[var(--dim)]">
            Autonomous multi-agent synthesis workbench for high-stakes decisions.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] font-medium text-[var(--dim)]">
          <Link href="/builder" className="transition-colors hover:text-[var(--ink)]">
            Workflow Builder
          </Link>
          <Link href="/history" className="transition-colors hover:text-[var(--ink)]">
            Run Library
          </Link>
          <Link href="/eval" className="transition-colors hover:text-[var(--ink)]">
            Benchmark Rig
          </Link>
          <Link href="/eval" className="transition-colors hover:text-[var(--ink)]">
            Performance Rig
          </Link>
          <a
            href="https://github.com/Bhagyansh07/SWARM"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-[var(--signal)]"
          >
            GitHub
          </a>
        </nav>
      </div>
      <div className="border-t border-[var(--line)]/50 py-4 text-center">
        <p className="font-mono text-[11px] text-[var(--faint)]">
          © {new Date().getFullYear()} SWARM Intelligence · Zero Data Retention · Open Architecture
        </p>
      </div>
    </footer>
  );
}
'use client';

import { useEffect } from 'react';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[swarm] page error', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-[var(--bad)] text-[var(--bad)]">
        <WarningCircle size={24} aria-hidden />
      </div>
      <p className="rack-index m-0">fault detected / render error</p>
      <h1 className="font-display m-0 text-[30px] font-black uppercase tracking-[0.04em] text-[var(--ink)]">
        The deck faulted
      </h1>
      <p className="m-0 max-w-[42ch] text-[14px] leading-relaxed text-[var(--dim)]">
        Something on this screen broke while rendering. Your missions are still stored — reload to reconnect.
      </p>
      <button type="button" onClick={reset} className="key px-5 py-2.5 text-[12px]">
        Reload deck
      </button>
      {error.digest && <p className="font-mono m-0 text-[10px] text-[var(--faint)]">digest: {error.digest}</p>}
    </div>
  );
}
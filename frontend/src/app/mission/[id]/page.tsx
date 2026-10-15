'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { MissionDashboard } from '@/components/dashboard/mission-dashboard';
import { SkeletonPanel } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useSession } from '@/lib/store';
import type { MissionDetailDto } from '@/lib/types';

function MissionView() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const connect = useSession((s) => s.connect);
  const disconnect = useSession((s) => s.disconnect);

  const [initial, setInitial] = useState<MissionDetailDto | null>(null);
  const [miss, setMiss] = useState(false);

  useEffect(() => {
    setMiss(false);
    setInitial(null);
    api
      .getMission(id)
      .then((r) => {
        setInitial(r.data);
      })
      .catch(() => setMiss(true));
  }, [id]);

  useEffect(() => {
    if (initial) {
      connect(id, initial, () => undefined);
    }
    return () => disconnect();
  }, [initial, id, connect, disconnect]);

  if (miss) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-400">
          Mission Not Found (404/410)
        </span>
        <h2 className="font-display text-[24px] font-bold text-white">
          Mission Trace Expired or Missing
        </h2>
        <p className="m-0 max-w-[40ch] text-[14px] leading-relaxed text-slate-400">
          This mission execution record no longer exists or the URL identifier is invalid. You can explore saved runs in the archive.
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            href="/history"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            <span>Return to Run Library</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="flex flex-col gap-6 pb-20 pt-8">
        <div className="h-10 w-1/3 rounded-2xl bg-white/[0.04] animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-[310px_1fr_330px]">
          <SkeletonPanel />
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      </div>
    );
  }

  return <MissionDashboard initial={initial} />;
}

export default function MissionPage() {
  return (
    <Suspense fallback={null}>
      <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 px-4 sm:px-6">
        <MissionView />
      </main>
    </Suspense>
  );
}
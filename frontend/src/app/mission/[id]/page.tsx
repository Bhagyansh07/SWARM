'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { MissionDashboard } from '@/components/dashboard/mission-dashboard';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
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
      <div className="flex flex-col items-center gap-4 py-32">
        <p className="rack-index m-0">mission not found / 410</p>
        <p className="m-0 max-w-[34ch] text-center text-[13.5px] leading-relaxed text-[var(--dim)]">
          This run no longer exists or its id was mistyped. The library still has the others.
        </p>
        <div className="flex gap-3">
          <a href="/history" className="ghost items-center gap-2 px-4 py-2 text-[12px] no-underline">
            <ArrowLeft size={13} aria-hidden /> Run library
          </a>
        </div>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="flex flex-col gap-4 pb-16 pt-10">
        <div className="skeleton h-6 w-2/5" />
        <div className="grid gap-4 lg:grid-cols-[300px_1fr_340px]">
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
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <main id="main" className="mx-auto w-full max-w-[1160px] flex-1 px-5">
          <MissionView />
        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
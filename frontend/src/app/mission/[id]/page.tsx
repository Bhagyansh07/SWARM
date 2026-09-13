'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MissionDashboard } from '@/components/dashboard/mission-dashboard';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { api } from '@/lib/api';
import { useSession } from '@/lib/store';
import type { MissionDetailDto } from '@/lib/types';

function MissionView() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const connect = useSession((s) => s.connect);

  const [initial, setInitial] = useState<MissionDetailDto | null>(null);
  const [miss, setMiss] = useState(false);

  useEffect(() => {
    setMiss(false);
    api
      .getMission(id)
      .then((r) => {
        setInitial(r.data);
        setMiss(false);
      })
      .catch(() => {
        setMiss(true);
        setInitial(null);
      });
  }, [id]);

  useEffect(() => {
    if (initial) {
      connect(id, initial, () => undefined);
    }
  }, [initial, id, connect]);

  if (miss) {
    return (
      <div className="flex flex-col items-center gap-4 py-32">
        <p className="font-mono m-0 text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">mission not found</p>
        <Link href="/" className="ghost px-4 py-2 text-[12px] no-underline">
          Back to HQ
        </Link>
      </div>
    );
  }

  if (!initial) {
    return <p className="font-mono m-0 py-32 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">loading mission…</p>;
  }

  return <MissionDashboard initial={initial} />;
}

export default function MissionPage() {
  return (
    <Suspense fallback={null}>
      <div className="bg-grid flex min-h-screen flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1160px] flex-1 px-5">
          <MissionView />
        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
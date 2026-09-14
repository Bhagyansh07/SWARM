'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MissionDashboard } from '@/components/dashboard/mission-dashboard';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { api } from '@/lib/api';
import type { MissionDetailDto } from '@/lib/types';

export default function SharedMissionPage() {
  const { token } = useParams<{ token: string }>();
  const [mission, setMission] = useState<MissionDetailDto | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api.getSharedMission(token).then((response) => setMission(response.data)).catch(() => setMissing(true));
  }, [token]);

  return (
    <div className="bg-grid flex min-h-screen flex-col">
      <Topbar />
      <main className="mx-auto w-full max-w-[1160px] flex-1 px-5">
        {missing ? (
          <div className="flex flex-col items-center gap-4 py-32">
            <p className="font-mono m-0 text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">shared mission not found</p>
            <Link href="/" className="ghost px-4 py-2 text-[12px] no-underline">Back to HQ</Link>
          </div>
        ) : mission ? (
          <MissionDashboard initial={mission} readOnly />
        ) : (
          <p className="font-mono m-0 py-32 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--faint)]">loading shared mission...</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

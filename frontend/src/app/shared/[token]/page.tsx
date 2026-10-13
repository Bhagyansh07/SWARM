'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MissionDashboard } from '@/components/dashboard/mission-dashboard';
import { Topbar } from '@/components/site/topbar';
import { Footer } from '@/components/site/footer';
import { SkeletonPanel } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { MissionDetailDto } from '@/lib/types';

export default function SharedMissionPage() {
  const { token } = useParams<{ token: string }>();
  const [mission, setMission] = useState<MissionDetailDto | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api
      .getSharedMission(token)
      .then((response) => setMission(response.data))
      .catch(() => setMissing(true));
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <main id="main" className="mx-auto w-full max-w-[1160px] flex-1 px-5">
        {missing ? (
          <div className="flex flex-col items-center gap-4 py-32">
            <p className="rack-index m-0">shared mission not found / 404</p>
            <p className="m-0 max-w-[36ch] text-center text-[13.5px] leading-relaxed text-[var(--dim)]">
              This share link is invalid or the mission was deleted. Share links are signed — tampered tokens are rejected server-side.
            </p>
            <Link href="/" className="ghost px-4 py-2 text-[12px] no-underline">
              Back to HQ
            </Link>
          </div>
        ) : mission ? (
          <MissionDashboard initial={mission} readOnly />
        ) : (
          <div className="flex flex-col gap-4 pb-16 pt-10">
            <div className="skeleton h-6 w-2/5" />
            <div className="grid gap-4 lg:grid-cols-[300px_1fr_340px]">
              <SkeletonPanel />
              <SkeletonPanel />
              <SkeletonPanel />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
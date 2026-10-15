'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { MissionDashboard } from '@/components/dashboard/mission-dashboard';
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
    <main id="main" className="mx-auto w-full max-w-[1180px] flex-1 px-4 sm:px-6">
      {missing ? (
        <div className="flex flex-col items-center gap-4 py-32 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-rose-400">
            Cryptographic Token Expired or Invalid (404)
          </span>
          <h2 className="font-display text-[24px] font-bold text-white">
            Shared Snapshot Unreachable
          </h2>
          <p className="m-0 max-w-[42ch] text-[14px] leading-relaxed text-slate-400">
            This share link signature failed verification or the mission record was purged.
          </p>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            <span>Return to Overview</span>
          </Link>
        </div>
      ) : mission ? (
        <MissionDashboard initial={mission} readOnly />
      ) : (
        <div className="flex flex-col gap-6 pb-20 pt-8">
          <div className="h-10 w-1/3 rounded-2xl bg-white/[0.04] animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-[310px_1fr_330px]">
            <SkeletonPanel />
            <SkeletonPanel />
            <SkeletonPanel />
          </div>
        </div>
      )}
    </main>
  );
}
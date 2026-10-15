'use client';

import { useState } from 'react';
import { Check, Copy, FileText, ShieldWarning, Sparkle } from '@phosphor-icons/react/dist/ssr';
import { copyText, reportMarkdown, type ExportInput } from '@/lib/export';
import type { LiveAnalytics, LiveReport } from '@/lib/store';

export function ReportPanel({
  report,
  analytics,
  exportData,
}: {
  report: LiveReport | null;
  analytics: LiveAnalytics | null;
  exportData?: ExportInput | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <div className="py-24 text-center">
        <Sparkle size={32} className="mx-auto text-cyan-400 animate-pulse" />
        <p className="font-mono mt-4 text-[12px] uppercase tracking-wider text-[var(--faint)]">
          Synthesis in flight · Awaiting convergence from Agent Nova...
        </p>
      </div>
    );
  }

  const copyMarkdown = async () => {
    if (!exportData) return;
    const ok = await copyText(reportMarkdown(exportData));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="space-y-6 p-5">
      {/* Header bar */}
      <div className="no-print flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Converged Executive Report
          </span>
        </div>

        {exportData && (
          <button
            type="button"
            onClick={() => void copyMarkdown()}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-slate-200 transition-all hover:bg-white/10 cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Primary Verdict Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 via-sky-950/30 to-[#0c101a] p-5 shadow-[0_0_30px_rgba(0,210,255,0.12)]">
        <div className="flex items-center gap-2">
          <Sparkle size={16} className="text-cyan-400" weight="fill" />
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-cyan-400">
            Official Verdict
          </span>
        </div>
        <p className="font-display mt-2 text-[17px] font-bold leading-relaxed text-white">
          {report.verdict}
        </p>
      </div>

      {/* Summary */}
      {report.summary && (
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h4 className="font-mono m-0 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
            Executive Summary
          </h4>
          <p className="m-0 mt-2 text-[14px] leading-relaxed text-slate-300">
            {report.summary}
          </p>
        </section>
      )}

      {/* Key Findings */}
      {report.keyFindings.length > 0 && (
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h4 className="font-mono m-0 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-400">
            Key Verified Findings ({report.keyFindings.length})
          </h4>
          <ul className="m-0 mt-3 list-none divide-y divide-white/[0.04]">
            {report.keyFindings.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[13.5px] leading-relaxed text-slate-300">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Risks & Unresolved Dissent */}
      {report.risks.length > 0 && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-5">
          <div className="flex items-center gap-2">
            <ShieldWarning size={16} className="text-amber-400" weight="fill" />
            <h4 className="font-mono m-0 text-[10.5px] font-semibold uppercase tracking-wider text-amber-400">
              Identified Risks & Preserved Dissent ({report.risks.length})
            </h4>
          </div>
          <ul className="m-0 mt-3 list-none divide-y divide-amber-500/10">
            {report.risks.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-mono text-[11px] font-bold text-amber-400">
                  !
                </span>
                <span className="text-[13.5px] leading-relaxed text-amber-200/90">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
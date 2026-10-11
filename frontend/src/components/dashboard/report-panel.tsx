'use client';

import { Check, Copy } from '@phosphor-icons/react/dist/ssr';
import { formatDuration } from '@/lib/hooks';
import { copyText, reportMarkdown, type ExportInput } from '@/lib/export';
import type { LiveAnalytics, LiveReport } from '@/lib/store';
import { useState } from 'react';

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
      <p className="font-mono m-0 px-4 py-14 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
        no report yet — the synthesizer is still converging…
      </p>
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
    <div className="space-y-5 px-4 py-4">
      <div className="no-print flex items-center justify-between gap-3">
        <span className="rack-index">final synthesis · ready to export</span>
        {exportData && (
          <button
            type="button"
            onClick={() => void copyMarkdown()}
            className="ghost px-3 py-1.5 text-[10px]"
            aria-label="Copy report as Markdown"
          >
            {copied ? (
              <>
                <Check size={12} aria-hidden /> copied
              </>
            ) : (
              <>
                <Copy size={12} aria-hidden /> copy markdown
              </>
            )}
          </button>
        )}
      </div>

      <div className="border-l-2 border-[var(--signal)] bg-[var(--signal-dim)] py-3 pl-4 pr-4">
        <p className="font-mono m-0 text-[9.5px] uppercase tracking-[0.18em] text-[var(--signal)]">Verdict</p>
        <p className="font-display m-0 mt-1.5 text-[15px] font-bold leading-relaxed text-[var(--ink)]">{report.verdict}</p>
      </div>

      {report.summary && (
        <section>
          <h4 className="font-mono m-0 text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Summary</h4>
          <p className="m-0 mt-2 text-[13px] leading-relaxed text-[var(--dim)]">{report.summary}</p>
        </section>
      )}

      {report.keyFindings.length > 0 && (
        <section>
          <h4 className="font-mono m-0 text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Key findings</h4>
          <ul className="m-0 mt-2 list-none">
            {report.keyFindings.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3 border-b border-[var(--line)] py-1.5 last:border-0">
                <span className="font-mono text-[10px] text-[var(--signal)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] leading-snug text-[var(--dim)]">{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.risks.length > 0 && (
        <section>
          <h4 className="font-mono m-0 text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Risks</h4>
          <ul className="m-0 mt-2 list-none">
            {report.risks.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3 border-b border-[var(--line)] py-1.5 last:border-0">
                <span className="font-mono text-[10px] text-[var(--warn)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] leading-snug text-[var(--dim)]">{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
        {[
          ['duration', formatDuration(analytics?.durationMs ?? 0)],
          ['tokens', String(analytics?.totalTokens ?? 0)],
          ['est. cost', analytics ? `$${analytics.estCostUsd.toFixed(5)}` : '—'],
        ].map(([k, v]) => (
          <div key={k} className="bg-[var(--paper)] p-2.5">
            <span className="rack-index block">{k}</span>
            <span className="font-mono block pt-1 text-[13px] text-[var(--ink)]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
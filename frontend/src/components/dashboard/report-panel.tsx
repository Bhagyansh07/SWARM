'use client';

import { formatDuration } from '@/lib/hooks';
import type { LiveAnalytics, LiveReport } from '@/lib/store';

export function ReportPanel({ report, analytics }: { report: LiveReport | null; analytics: LiveAnalytics | null }) {
  if (!report) {
    return (
      <p className="font-mono m-0 px-4 py-14 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
        no report yet — the synthesizer is still converging…
      </p>
    );
  }
  const exportMarkdown = () => {
    const markdown = [
      `# SWARM Mission Report`,
      '',
      `## Verdict`,
      report.verdict,
      '',
      `## Summary`,
      report.summary,
      '',
      `## Key Findings`,
      ...report.keyFindings.map((finding) => `- ${finding}`),
      '',
      `## Risks`,
      ...report.risks.map((risk) => `- ${risk}`),
      '',
      `## Telemetry`,
      `- Tokens: ${analytics?.totalTokens ?? 0}`,
      `- Estimated cost: $${analytics?.estCostUsd.toFixed(5) ?? '0.00000'}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'swarm-report.md';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5 px-4 py-4">
      <div className="flex justify-end">
        <button onClick={exportMarkdown} className="ghost px-3 py-1.5 text-[10px]">Export .md</button>
      </div>
      <div className="flex items-start gap-3">
        <span className="led mt-1.5" aria-hidden style={{ background: 'var(--signal)', boxShadow: '0 0 6px var(--signal)' }} />
        <p className="font-display m-0 text-[15px] font-bold leading-relaxed text-[var(--ink)]">{report.verdict}</p>
      </div>

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

      <p className="font-mono m-0 text-[11px] leading-relaxed text-[var(--faint)]">{report.summary}</p>
    </div>
  );
}
import type { ExportInput } from './export';

const PDF = {
  ink: '#17161a',
  muted: '#6b6a72',
  faint: '#9a9aa3',
  accent: '#e85d2a',
  ok: '#178a5a',
  warn: '#b07a13',
  paper: '#ffffff',
  surface: '#f4f2f1',
  line: '#e3e0dd',

  margin: 16,
  pageW: 210,
  pageH: 297,
  contentW: 178,
};

type Doc = import('jspdf').jsPDF;

function header(doc: Doc, title: string, sub: string) {
  const { margin, contentW } = PDF;
  const y = margin;
  doc.setFillColor(PDF.ink);
  doc.rect(margin, y, contentW, 24, 'F');
  doc.setTextColor(PDF.accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SWARM', margin + 8, y + 16);
  doc.setTextColor('#ffffff');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), margin + contentW - 8, y + 11, { align: 'right' });
  doc.text(sub.toUpperCase(), margin + contentW - 8, y + 18, { align: 'right' });
  return y + 36;
}

function label(doc: Doc, text: string, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PDF.accent);
  doc.text(text.toUpperCase(), PDF.margin, y);
  doc.setDrawColor(PDF.accent);
  doc.setLineWidth(0.6);
  doc.line(PDF.margin + doc.getTextWidth(text.toUpperCase()) + 4, y - 1.4, PDF.margin + PDF.contentW, y - 1.4);
  return y + 6;
}

function para(doc: Doc, text: string, y: number, size = 9.5, color = PDF.ink): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(color);
  const lines = doc.splitTextToSize(text, PDF.contentW);
  for (const line of lines) {
    if (y > PDF.pageH - 22) {
      doc.addPage();
      y = PDF.margin;
    }
    doc.text(line, PDF.margin, y);
    y += size * 0.55;
  }
  return y + 3.4;
}

function bullets(doc: Doc, items: string[], y: number, color: string): number {
  for (let i = 0; i < items.length; i += 1) {
    const text = items[i];
    const num = `${String(i + 1).padStart(2, '0')}`;
    if (y > PDF.pageH - 24) {
      doc.addPage();
      y = PDF.margin;
    }
    doc.setFillColor(color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(color);
    doc.text(num, PDF.margin + 2, y, { align: 'left' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(PDF.ink);
    const lines = doc.splitTextToSize(text, PDF.contentW - 16);
    let ly = y;
    for (const line of lines) {
      if (ly > PDF.pageH - 22) {
        doc.addPage();
        ly = PDF.margin;
      }
      doc.text(line, PDF.margin + 12, ly);
      ly += 5.3;
    }
    y = ly + 5.5;
  }
  return y;
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

/** Generate and download a branded A4 PDF report. */
export async function downloadReportPdf(d: ExportInput): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc: Doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  let y = header(doc, 'Mission report', `${d.name} · ${d.template.replaceAll('_', ' ')}`);

  // Meta block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(PDF.ink);
  const nameLines = doc.splitTextToSize(d.name, PDF.contentW) as string[];
  doc.text(nameLines, PDF.margin, y);
  y += nameLines.length * 6.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PDF.muted);
  doc.text(`ID  ${d.id}    ·    ${d.provider}/${d.model}    ·    status ${d.status}`, PDF.margin, y);
  y += 5;

  if (d.prompt) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(PDF.muted);
    const promptLines = doc.splitTextToSize(`Brief: ${d.prompt}`, PDF.contentW) as string[];
    doc.text(promptLines, PDF.margin, y);
    y += promptLines.length * 4.6 + 6;
  }

  const r = d.report;
  if (r) {
    y = label(doc, 'Verdict', y);
    y = para(doc, r.verdict, y, 10, PDF.ink);
    y += 2;

    if (r.summary) {
      y = label(doc, 'Summary', y);
      y = para(doc, r.summary, y, 9.5, PDF.muted);
      y += 2;
    }

    if (r.keyFindings.length) {
      y = label(doc, 'Key findings', y);
      y = bullets(doc, r.keyFindings, y, PDF.accent);
      y += 3;
    }

    if (r.risks.length) {
      y = label(doc, 'Risks', y);
      y = bullets(doc, r.risks, y, PDF.warn);
      y += 3;
    }
  } else {
    y = label(doc, 'Report', y);
    y = para(doc, 'No report captured for this mission yet.', y, 9.5, PDF.muted);
    y += 3;
  }

  // Telemetry tiles
  const a = d.analytics;
  const tiles: Array<[string, string]> = [
    ['tokens', `${a?.totalTokens ?? d.totalTokens}`],
    ['duration', fmtDuration(a?.durationMs ?? 0)],
    ['est. cost', a ? `$${a.estCostUsd.toFixed(6)}` : '—'],
    ['messages', `${a?.messages ?? 0}`],
    ['graph', `${a?.graphNodes ?? 0}n / ${a?.graphEdges ?? 0}e`],
    ['model', `${d.provider}/${d.model}`],
  ];
  if (y > PDF.pageH - 60) {
    doc.addPage();
    y = PDF.margin;
  }
  y = label(doc, 'Telemetry', y);
  const tileW = (PDF.contentW - 2 * 3) / 3;
  const tileH = 16;
  tiles.forEach(([k, v], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = PDF.margin + col * (tileW + 3);
    const ty = y + row * (tileH + 3);
    doc.setFillColor(PDF.surface);
    doc.setDrawColor(PDF.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, ty, tileW, tileH, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(PDF.faint);
    doc.text(k.toUpperCase(), x + 4, ty + 6);
    doc.setFontSize(9.5);
    doc.setTextColor(PDF.ink);
    doc.text(v, x + 4, ty + 12);
  });

  // Footer
  const fy = PDF.pageH - 12;
  doc.setDrawColor(PDF.line);
  doc.setLineWidth(0.2);
  doc.line(PDF.margin, fy - 6, PDF.margin + PDF.contentW, fy - 6);
  doc.setFontSize(7);
  doc.setTextColor(PDF.faint);
  const stamp = `Generated ${new Date().toISOString()} · ${d.status} report`;
  doc.text(stamp, PDF.margin, fy);
  doc.text(d.provider === 'simulation' ? 'Simulated run' : 'groq free tier · live inference', PDF.margin + PDF.contentW, fy, { align: 'right' });

  doc.save(`swarm-report-${d.id}.pdf`);
}
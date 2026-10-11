'use client';

import { useState } from 'react';
import {
  BracketsCurly,
  FilePdf,
  FileText,
  Printer,
  ShareNetwork,
} from '@phosphor-icons/react/dist/ssr';
import type { ExportInput } from '@/lib/export';
import { copyText, downloadJson, downloadMarkdown } from '@/lib/export';
import { downloadReportPdf } from '@/lib/pdf';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui';

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="btn-icon">
        {children}
      </button>
    </Tooltip>
  );
}

export function MissionToolbar({ d }: { d: ExportInput }) {
  const toast = useToast();
  const [pdfBusy, setPdfBusy] = useState(false);

  const share = async () => {
    try {
      const result = await api.shareMission(d.id);
      const url = `${window.location.origin}/shared/${result.data.token}`;
      const ok = await copyText(url);
      toast.push(ok ? 'Share link copied to clipboard.' : url, ok ? 'ok' : 'info');
    } catch {
      toast.push('Could not create a share link.', 'bad');
    }
  };

  const pdf = async () => {
    setPdfBusy(true);
    try {
      await downloadReportPdf(d);
      toast.push('PDF report downloaded.', 'ok');
    } catch {
      toast.push('PDF export failed — use Markdown instead.', 'bad');
    } finally {
      setPdfBusy(false);
    }
  };

  const md = () => {
    downloadMarkdown(d);
    toast.push('Markdown report downloaded.', 'ok');
  };

  const json = () => {
    downloadJson(d);
    toast.push('Mission JSON downloaded.', 'ok');
  };

  return (
    <div className="no-print flex items-center gap-1.5" role="group" aria-label="Mission actions">
      <IconBtn label="Copy share link" onClick={() => void share()}>
        <ShareNetwork size={14} aria-hidden />
      </IconBtn>
      <IconBtn label={pdfBusy ? 'Preparing PDF…' : 'Download PDF report'} onClick={() => void pdf()} disabled={pdfBusy}>
        {pdfBusy ? <span className="h-3 w-3 animate-pulse bg-[var(--signal)]" aria-hidden /> : <FilePdf size={14} aria-hidden />}
      </IconBtn>
      <IconBtn label="Download Markdown" onClick={md}>
        <FileText size={14} aria-hidden />
      </IconBtn>
      <IconBtn label="Download mission JSON" onClick={json}>
        <BracketsCurly size={14} aria-hidden />
      </IconBtn>
      <IconBtn label="Print / save as PDF" onClick={() => window.print()}>
        <Printer size={14} aria-hidden />
      </IconBtn>
    </div>
  );
}
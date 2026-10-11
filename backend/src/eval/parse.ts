export interface JudgeParsed {
  scoreA: number;
  scoreB: number;
  winner: 'A' | 'B' | 'TIE';
  rationale: string;
}

function clampScore(raw: string | undefined): number {
  const n = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0;
}

/**
 * Parses the judge model's free-form verdict. Tolerant: accepts SCORE_A/SCORE_B
 * on their own line or trailing a label, scores 1-5 (float ok), WINNER A|B|TIE,
 * and anything after RATIONALE up to the end of the text.
 */
export function parseJudgeOutput(text: string): JudgeParsed {
  const trimmed = text.trim();

  const scoreA = clampScore(/SCORE_A\s*[:=]?\s*(\d+(?:\.\d+)?)/i.exec(trimmed)?.[1]);
  const scoreB = clampScore(/SCORE_B\s*[:=]?\s*(\d+(?:\.\d+)?)/i.exec(trimmed)?.[1]);

  const winnerMatch = /WINNER\s*[:=]?\s*([A-Z]|TIE)/i.exec(trimmed);
  const winnerVal = winnerMatch?.[1]?.toUpperCase();
  const winner: 'A' | 'B' | 'TIE' = winnerVal === 'A' ? 'A' : winnerVal === 'B' ? 'B' : 'TIE';

  const rationale = (trimmed.match(/RATIONALE\s*[:=]?\s*([\s\S]*)/i)?.[1] ?? '').trim().slice(0, 500);

  return { scoreA, scoreB, winner, rationale };
}
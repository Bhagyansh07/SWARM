import { describe, expect, it } from 'vitest';
import { getTemplate, resolveConfiguration } from '../src/orchestrator/templates';
import { TEMPLATES, AGENT_ROSTER, type AgentRole } from '../src/types';
import { simulate } from '../src/llm/simulation';
import { missionIdFromToken, shareToken } from '../src/lib/share';

describe('template registry', () => {
  it('exposes the four mission templates in order', () => {
    expect(TEMPLATES.map((t) => t.key)).toEqual(['deep_research', 'product_review', 'startup_validation', 'code_review']);
  });

  it('resolves a template agent order', () => {
    const { order } = resolveConfiguration('product_review');
    expect(order).toEqual(['researcher', 'critic', 'analyst', 'synthesizer']);
  });

  it('rejects unknown templates', () => {
    expect(() => resolveConfiguration('nope')).toThrow(/unknown template/);
  });

  it('honours an explicit config.agents override', () => {
    const { order } = resolveConfiguration('deep_research', { agents: ['critic', 'synthesizer'] });
    expect(order).toEqual(['critic', 'synthesizer']);
  });

  it('rejects non-executable orchestration roles', () => {
    expect(() => resolveConfiguration('deep_research', { agents: ['orchestrator' as AgentRole] })).toThrow(/invalid agent configuration/);
  });
});

describe('agent roster', () => {
  it('defines the five roles with unique names', () => {
    const roles = Object.keys(AGENT_ROSTER) as AgentRole[];
    expect(roles.sort()).toEqual(['analyst', 'critic', 'orchestrator', 'researcher', 'synthesizer']);
    const names = roles.map((r) => AGENT_ROSTER[r].name);
    expect(new Set(names).size).toBe(5);
  });
});

describe('simulation provider', () => {
  const ctx = { role: 'researcher', prompt: 'What is the future of local retail?', name: 'Kai', missionName: 'M', template: 'deep_research', previousFindings: [] as string[] };

  it('produces deterministic, non-empty output for each role', () => {
    for (const role of ['researcher', 'analyst', 'critic', 'synthesizer'] as AgentRole[]) {
      const out = simulate({ ...ctx, role }, 42);
      expect(out.messages.length).toBeGreaterThan(0);
      expect(out.tokensUsed).toBeGreaterThan(0);
      expect(out.confidence).toBeGreaterThan(0);
    }
  });

  it('returns identical content for the same seed', () => {
    const a = simulate({ ...ctx, role: 'analyst' }, 7);
    const b = simulate({ ...ctx, role: 'analyst' }, 7);
    expect(a.messages.map((m) => m.content)).toEqual(b.messages.map((m) => m.content));
  });
});

describe('share tokens', () => {
  it('round-trips a mission id', () => {
    const id = '485e839b-e4c5-4f53-b52a-bebe677328fc';
    expect(missionIdFromToken(shareToken(id))).toBe(id);
  });

  it('is deterministic for the same id', () => {
    const id = 'abc-123';
    expect(shareToken(id)).toBe(shareToken(id));
  });

  it('rejects a tampered signature or malformed token', () => {
    const token = shareToken('abc-123');
    expect(missionIdFromToken(`${token.slice(0, -2)}zz`)).toBeNull();
    expect(missionIdFromToken('not-a-token')).toBeNull();
    expect(missionIdFromToken('')).toBeNull();
  });
});
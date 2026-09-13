import { TEMPLATES, type TemplateDef, type MissionConfig } from '../types';

export const EXECUTABLE_ROLES = ['researcher', 'analyst', 'critic', 'synthesizer'] as const;

export function isExecutableRole(role: string): boolean {
  return (EXECUTABLE_ROLES as readonly string[]).includes(role);
}

export function validateAgentOrder(order: string[]): boolean {
  return order.length > 0 && order.every(isExecutableRole);
}

export function getTemplate(key: string): TemplateDef {
  const t = TEMPLATES.find((t) => t.key === key);
  if (!t) throw new Error(`unknown template: ${key}`);
  return t;
}

export function resolveConfiguration(
  templateKey: string,
  config?: MissionConfig,
): { order: string[] } {
  if (config && Array.isArray(config.agents) && config.agents.length > 0) {
    if (!validateAgentOrder(config.agents)) {
      throw new Error('invalid agent configuration');
    }
    return { order: config.agents };
  }
  const t = getTemplate(templateKey);
  return { order: t.agents };
}
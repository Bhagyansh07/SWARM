import { TEMPLATES, type TemplateDef, type MissionConfig } from '../types';

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
    return { order: config.agents };
  }
  const t = getTemplate(templateKey);
  return { order: t.agents };
}
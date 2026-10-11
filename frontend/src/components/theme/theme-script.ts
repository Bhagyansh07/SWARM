/**
 * Theme bootstrap script — deliberately NOT a client component module so the
 * server layout can import this plain function directly (RSC forbids calling
 * non-component functions exported from 'use client' modules on the server).
 */

export const THEME_STORAGE_KEY = 'swarm.theme';

/**
 * Returns a small synchronous script injected into <head>. It resolves the
 * stored theme (light/dark/system) before first paint so there is never a
 * flash of the wrong theme.
 */
export function themeScript(): string {
  return `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: light)').matches;var r=(t==='light'||t==='dark')?t:(m?'light':'dark');document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark';}})();`;
}
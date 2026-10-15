/**
 * Theme bootstrap script — resolves theme before paint to avoid flash.
 * Defaults strictly to dark mode for the premium cinematic SaaS experience.
 */
export const THEME_STORAGE_KEY = 'swarm.theme';

export function themeScript(): string {
  return `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);var sys=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';var r=t==='light'?'light':t==='dark'?'dark':t==='system'?sys:'dark';var d=document.documentElement;d.dataset.theme=r;d.style.colorScheme=r;if(r==='dark'){d.classList.add('dark');d.classList.remove('light');}else{d.classList.add('light');d.classList.remove('dark');}}catch(e){var d=document.documentElement;d.dataset.theme='dark';d.style.colorScheme='dark';d.classList.add('dark');}})();`;
}
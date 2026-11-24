import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';
import { $, reduce } from './studio/core';
import { Store, initStore, normalize, route } from './studio/store';

gsap.registerPlugin(ScrollTrigger);

function showLoader(): void {
  ($('#app') as HTMLElement).innerHTML = '<div class="denied"><div><span class="mark" style="width:30px;height:30px"></span></div></div>';
  if (!reduce) gsap.fromTo('#app .mark', { rotate: 0 }, { rotate: 360, duration: 2.4, ease: 'none', repeat: -1 });
}

async function boot(): Promise<void> {
  showLoader();
  // Never leave visitors on the loader: after 6 s show the starter site and keep loading.
  const fallback = setTimeout(() => { if (!Store.live) { Store.live = normalize(null); route(); } }, 6000);
  try { await initStore(); } catch (e) { console.error('Could not load the site settings', e); Store.live = Store.live || normalize(null); }
  clearTimeout(fallback);
  addEventListener('hashchange', route);
  route();
}

void boot();

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';
import { initLoader, finishLoader } from './loader';
import { Store, initStore, normalize, route } from './studio/store';
import { bootEmbed, isEmbed } from './studio/embed';

gsap.registerPlugin(ScrollTrigger);

async function boot(): Promise<void> {
  initLoader();
  // Never leave visitors on the loader: after 6 s show the starter site and keep loading.
  const fallback = setTimeout(() => { if (!Store.live) { Store.live = normalize(null); route(); finishLoader(Store.live); } }, 6000);
  try { await initStore(); } catch (e) { console.error('Could not load the site settings', e); Store.live = Store.live || normalize(null); }
  clearTimeout(fallback);
  addEventListener('hashchange', route);
  route();
  finishLoader(Store.live);
}

// The studio's live preview window loads this page in a frame and sends it the draft.
if (isEmbed()) bootEmbed(); else void boot();

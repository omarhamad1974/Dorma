/* Pure helpers for reference pages (no Deno, no network), shared by fetchref.ts and the tests. */
const MAX_CHARS = 6000;

/** True for addresses on the public internet; false for private, loopback, link-local, carrier-grade NAT, multicast… */
export function publicIp(ip: string): boolean {
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [+v4[1], +v4[2]];
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 192 && b === 0 && +v4[3] === 0) return false; // 192.0.0.0/24
    if (a === 198 && (b === 18 || b === 19)) return false;
    return true;
  }
  const x = ip.toLowerCase();
  if (x === '::' || x === '::1') return false;
  if (x.startsWith('::ffff:')) return publicIp(x.slice(7));
  if (/^f[cd]/.test(x) || /^fe[89ab]/.test(x) || x.startsWith('ff')) return false;
  return x.includes(':');
}

/** Page text without scripts, styles, menus and tags. */
export function htmlToText(html: string): { title: string; text: string } {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim()).slice(0, 200);
  let h = html.replace(/<!--[\s\S]*?-->/g, ' ');
  h = h.replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe|template)\b[\s\S]*?<\/\1>/gi, ' ');
  const main = h.match(/<(main|article)\b[\s\S]*?<\/\1>/i)?.[0];
  if (main && main.length > 500) h = main;
  h = h.replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section)\b[^>]*>/gi, '\n').replace(/<li\b[^>]*>/gi, '\n- ').replace(/<[^>]+>/g, ' ');
  const text = decode(h).split('\n').map((l) => l.replace(/[ \t ]+/g, ' ').trim()).filter((l) => l.length > 1).join('\n').replace(/\n{3,}/g, '\n\n');
  return { title, text: text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + ' …' : text };
}
function decode(s: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, c: string) => {
    if (c[0] === '#') { const n = c[1].toLowerCase() === 'x' ? parseInt(c.slice(2), 16) : parseInt(c.slice(1), 10); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ' '; }
    return named[c.toLowerCase()] ?? m;
  });
}

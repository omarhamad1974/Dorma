/* ================= STORAGE =================
   live  = what visitors see (site_config row 'live')
   draft = what the studio is editing (row 'draft', autosaved), published to live on demand
   Without Supabase (VITE_OFFLINE=1 or no keys), both live in this browser only. */
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { MEDIA_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL, online } from '../config';
import { normalize } from './data';
import { normalizeSocial } from './social';
import { seoSlug } from './libtools';
export { normalize };
import { clone } from './core';
import { Site, renderSite } from './site';
import { renderAdmin } from './admin';

// The settings object is free-form JSON shaped like STARTER.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Config = any;
export type Status = 'saved' | 'pending' | 'saving' | 'error' | 'published';

export const Store = {
  mode: 'local' as 'db' | 'local',
  session: null as Session | null,
  canEdit: false,
  live: null as Config,
  draft: null as Config,
  liveAt: 0,
  draftAt: 0,
  saving: false,
  queued: false,
  timer: 0 as ReturnType<typeof setTimeout> | 0,
  status: 'saved' as Status,
  statusMsg: '',
  listeners: [] as Array<() => void>,
};

const LS = {
  get(k: string): unknown {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  set(k: string, v: unknown): void {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ }
  },
};

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

function setStatus(s: Status, msg = ''): void {
  Store.status = s; Store.statusMsg = msg; Store.listeners.forEach((f) => f());
}

async function checkEditor(): Promise<void> {
  if (!Store.session) { Store.canEdit = false; return; }
  const { data, error } = await db().rpc('is_editor');
  Store.canEdit = !error && data === true;
}

/** Loads the live config. Returns once the first version is known (or the starter template on failure). */
export async function initStore(): Promise<void> {
  if (!online()) {
    Store.mode = 'local'; Store.canEdit = true;
    Store.live = normalize(LS.get('dorma.live'));
    return;
  }
  Store.mode = 'db';
  const sb = db();
  const [{ data: s }, live] = await Promise.all([
    sb.auth.getSession(),
    sb.from('site_config').select('config, updated_at').eq('id', 'live').maybeSingle(),
  ]);
  Store.session = s.session;
  Store.live = normalize(live.data?.config);
  Store.liveAt = live.data ? Date.parse(live.data.updated_at) : 0;
  await checkEditor();
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') { Store.session = session; return; }
    const changed = (session?.user?.id || '') !== (Store.session?.user?.id || '');
    Store.session = session;
    // Sign-in or sign-out in another tab: show the right screen here too.
    if (changed) void checkEditor().then(() => { Store.draft = null; route(); });
  });
}

export async function loadDraft(): Promise<Config> {
  if (Store.draft) return Store.draft;
  if (Store.mode === 'db') {
    const { data, error } = await db().from('site_config').select('config, updated_at').eq('id', 'draft').maybeSingle();
    Store.draft = !error && data ? normalize(data.config) : clone(Store.live);
    Store.draftAt = data ? Date.parse(data.updated_at) : 0;
  } else {
    Store.draft = normalize(LS.get('dorma.draft') || Store.live);
  }
  return Store.draft;
}

export function scheduleSave(): void {
  setStatus('pending'); clearTimeout(Store.timer); Store.timer = setTimeout(saveDraft, 900);
}

function saveError(e: { code?: string; message?: string } | null): string {
  if (!e) return "Couldn't save. Check your connection and try again.";
  if (e.code === '42501' || /row-level security|permission/i.test(e.message || '')) return 'Your account can view the studio but not save changes.';
  if (e.code === 'PGRST301' || /jwt/i.test(e.message || '')) return 'Your sign-in expired. Sign in again to keep saving.';
  return "Couldn't save. Check your connection and try again.";
}

export async function saveDraft(): Promise<void> {
  clearTimeout(Store.timer);
  if (Store.saving) { Store.queued = true; return; }
  Store.saving = true; setStatus('saving');
  try {
    if (Store.mode === 'db') {
      const { error } = await db().from('site_config').upsert({ id: 'draft', config: clone(Store.draft) });
      if (error) throw error;
    } else LS.set('dorma.draft', Store.draft);
    Store.draftAt = Date.now(); setStatus('saved');
  } catch (e) {
    setStatus('error', saveError(e as { code?: string; message?: string }));
  }
  Store.saving = false;
  if (Store.queued) { Store.queued = false; void saveDraft(); }
}

export async function publishDraft(): Promise<boolean> {
  await saveDraft();
  if (Store.status === 'error') return false;
  try {
    if (Store.mode === 'db') {
      const { error } = await db().rpc('publish_draft');
      if (error) throw error;
    } else LS.set('dorma.live', Store.draft);
    Store.live = clone(Store.draft); Store.liveAt = Date.now(); setStatus('published'); return true;
  } catch (e) {
    setStatus('error', "Couldn't publish. " + ((e as Error)?.message || '')); return false;
  }
}

export const draftDiffers = (): boolean => JSON.stringify(Store.draft) !== JSON.stringify(Store.live);

/* ---------- published versions ---------- */
export interface Version { id: number; published_at: string }
export async function listVersions(): Promise<Version[]> {
  if (Store.mode !== 'db') return [];
  const { data } = await db().from('site_versions').select('id, published_at').order('id', { ascending: false }).limit(30);
  return (data as Version[]) || [];
}
/** Puts an earlier published version into the draft, so it can be checked and published again. */
export async function restoreVersion(id: number): Promise<boolean> {
  const { data, error } = await db().from('site_versions').select('config').eq('id', id).maybeSingle();
  if (error || !data) return false;
  Store.draft = normalize(data.config); scheduleSave(); return true;
}

/* ---------- social plan (studio → Social) ----------
   Templates, hashtags, the weekly rhythm and the calendar live in their own editors-only row (social_plan),
   so they are never published with the site. Until that table exists (or offline) they stay in this browser. */
export const Social = {
  data: null as Config,
  where: 'local' as 'db' | 'local',
  status: 'saved' as Status,
  timer: 0 as ReturnType<typeof setTimeout> | 0,
  saving: false,
  queued: false,
  listeners: [] as Array<() => void>,
};
function socialStatus(s: Status): void { Social.status = s; Social.listeners.forEach((f) => f()); }
export async function loadSocial(): Promise<Config> {
  if (Social.data) return Social.data;
  const local = LS.get('dorma.social');
  if (Store.mode === 'db') {
    const { data, error } = await db().from('social_plan').select('data').eq('id', 'main').maybeSingle();
    if (!error) {
      Social.where = 'db'; Social.data = normalizeSocial(data ? data.data : local);
      if (!data && local) scheduleSocialSave(); // a plan kept in this browser before the table existed moves in
      return Social.data;
    }
  }
  Social.where = 'local'; Social.data = normalizeSocial(local);
  return Social.data;
}
export function scheduleSocialSave(): void {
  socialStatus('pending'); clearTimeout(Social.timer); Social.timer = setTimeout(saveSocial, 700);
}
export async function saveSocial(): Promise<void> {
  clearTimeout(Social.timer);
  if (!Social.data) return;
  if (Social.saving) { Social.queued = true; return; }
  Social.saving = true; socialStatus('saving');
  try {
    if (Social.where === 'db') {
      const { error } = await db().from('social_plan').upsert({ id: 'main', data: clone(Social.data) });
      if (error) throw error;
    }
    LS.set('dorma.social', Social.data); // a copy in this browser too, so nothing is lost if the connection drops
    socialStatus('saved');
  } catch {
    LS.set('dorma.social', Social.data); socialStatus('error');
  }
  Social.saving = false;
  if (Social.queued) { Social.queued = false; void saveSocial(); }
}

/* ---------- sign-in (editors) ---------- */
export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) {
    if (/invalid/i.test(error.message)) return 'That email and password don\'t match an account.';
    if (/fetch|network/i.test(error.message)) return 'Couldn\'t reach the server. Check your connection and try again.';
    return error.message;
  }
  const { data } = await db().auth.getSession();
  Store.session = data.session; await checkEditor(); Store.draft = null;
  return null;
}
export async function signOut(): Promise<void> {
  await db().auth.signOut(); Store.session = null; Store.canEdit = false; Store.draft = null; Social.data = null;
}
export const signedInEmail = (): string => Store.session?.user?.email || '';

/* ---------- media uploads (Supabase Storage) ----------
   Files are stored as <year-month>/<readable-name>.<ext> (e.g. 2026-11/dorma-booth-riyadh.webp) so their addresses
   read well for search engines; a name already taken gets -2, -3… Renaming moves the file (Library › SEO). */
export interface MediaApi {
  upload(file: File, name?: string): Promise<{ id: string; url: string }>;
  rename(id: string, to: string): Promise<{ id: string; url: string }>;
  delete(id: string): Promise<void>;
}
const taken = (e: { message?: string; statusCode?: string } | null): boolean =>
  !!e && (/exists|duplicate/i.test(e.message || '') || e.statusCode === '409');
/** Upload helper for editors, or null when uploads aren't possible (offline build, signed out). */
export function media(): MediaApi | null {
  if (Store.mode !== 'db' || !Store.canEdit) return null;
  const bucket = () => db().storage.from(MEDIA_BUCKET);
  const url = (path: string) => bucket().getPublicUrl(path).data.publicUrl;
  return {
    async upload(file, name) {
      const ext = (file.name.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '').toLowerCase();
      const base = seoSlug(name || file.name.replace(/\.[^.]+$/, '')) || crypto.randomUUID().slice(0, 8);
      const dir = new Date().toISOString().slice(0, 7);
      for (let n = 1; n < 30; n++) {
        const path = `${dir}/${base}${n > 1 ? '-' + n : ''}${ext}`;
        const { error } = await bucket().upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
        if (!error) return { id: path, url: url(path) };
        if (!taken(error as { message?: string })) throw error;
      }
      throw new Error('Too many files with that name');
    },
    async rename(id, to) {
      if (id === to) return { id, url: url(id) };
      const ext = to.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '', base = ext ? to.slice(0, -ext.length) : to;
      for (let n = 1; n < 30; n++) {
        const path = n > 1 ? `${base}-${n}${ext}` : to;
        const { error } = await bucket().move(id, path);
        if (!error) return { id: path, url: url(path) };
        if (!taken(error as { message?: string })) throw error;
      }
      throw new Error('Too many files with that name');
    },
    async delete(id) {
      const { error } = await bucket().remove([id]);
      if (error) throw error;
    },
  };
}
/** Public uploads are the only remote media the site shows. */
export const isMediaUrl = (u: unknown): u is string =>
  typeof u === 'string' && online() && u.startsWith(`${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`);

/* ================= ROUTER ================= */
export function route(): void {
  const id = (location.hash || '').slice(1);
  if (id === 'admin') { Site.preview = false; void renderAdmin(); return; }
  if (Site.preview && Store.draft) { renderSite(Store.draft, id); return; }
  renderSite(Store.live || normalize(null), id);
}

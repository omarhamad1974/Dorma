/* ================= STORAGE =================
   live  = what visitors see (site_config row 'live')
   draft = what the studio is editing (row 'draft', autosaved), published to live on demand
   Without Supabase (VITE_OFFLINE=1 or no keys), both live in this browser only. */
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { MEDIA_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL, online } from '../config';
import { normalize } from './data';
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
  await db().auth.signOut(); Store.session = null; Store.canEdit = false; Store.draft = null;
}
export const signedInEmail = (): string => Store.session?.user?.email || '';

/* ---------- media uploads (Supabase Storage) ---------- */
export interface MediaApi {
  upload(file: File): Promise<{ id: string; url: string }>;
  delete(id: string): Promise<void>;
}
/** Upload helper for editors, or null when uploads aren't possible (offline build, signed out). */
export function media(): MediaApi | null {
  if (Store.mode !== 'db' || !Store.canEdit) return null;
  const bucket = () => db().storage.from(MEDIA_BUCKET);
  return {
    async upload(file) {
      const ext = (file.name.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '').toLowerCase();
      const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}${ext}`;
      const { error } = await bucket().upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
      if (error) throw error;
      return { id: path, url: bucket().getPublicUrl(path).data.publicUrl };
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

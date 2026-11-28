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
import { leaveStudioText } from './comfort';
import { renderProposal } from './proposalsite';

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

/* ---------- client proposals (studio → Content → Proposals; site → #for/<code>) ----------
   Each proposal is a row in its own table (0005_proposals.sql), saved as soon as it changes, like the social plan.
   Visitors never read the table: openProposal() asks the database for one proposal by its code, which also counts
   the open. Offline (or before the table exists) proposals stay in this browser. */
export interface ProposalRow { id: string; slug: string; data: Config; status: 'live' | 'off' | 'archived'; expires_on: string | null; searchable: boolean; created_at?: string; updated_at?: string }
export interface ProposalStat { opens: number; last: string | null }
export interface ProposalOpen { opened_at: string; lang: string | null; device: string | null }
export const Proposals = {
  rows: null as ProposalRow[] | null,
  stats: {} as Record<string, ProposalStat>,
  where: 'local' as 'db' | 'local',
  status: 'saved' as Status,
  message: '',
  timers: {} as Record<string, ReturnType<typeof setTimeout>>,
  listeners: [] as Array<() => void>,
};
const PROPOSAL_COLS = 'id, slug, data, status, expires_on, searchable, created_at, updated_at';
function proposalStatus(s: Status, msg = ''): void { Proposals.status = s; Proposals.message = msg; Proposals.listeners.forEach((f) => f()); }
const localProposals = (): ProposalRow[] => (LS.get('dorma.proposals') as ProposalRow[]) || [];
export async function loadProposals(force = false): Promise<ProposalRow[]> {
  if (Proposals.rows && !force) return Proposals.rows;
  if (Store.mode === 'db') {
    const { data, error } = await db().from('proposals').select(PROPOSAL_COLS).order('created_at', { ascending: false });
    if (!error) {
      Proposals.where = 'db'; Proposals.rows = (data as ProposalRow[]) || [];
      const st = await db().rpc('proposal_stats');
      Proposals.stats = {};
      ((st.data as Array<{ proposal_id: string; opens: number; last_opened: string }>) || []).forEach((r) => {
        Proposals.stats[r.proposal_id] = { opens: Number(r.opens) || 0, last: r.last_opened };
      });
      return Proposals.rows;
    }
  }
  Proposals.where = 'local'; Proposals.rows = localProposals();
  return Proposals.rows;
}
/** Saves one proposal shortly after its last change. */
export function scheduleProposalSave(row: ProposalRow): void {
  proposalStatus('pending'); clearTimeout(Proposals.timers[row.id]);
  Proposals.timers[row.id] = setTimeout(() => { void saveProposal(row); }, 700);
}
export async function saveProposal(row: ProposalRow): Promise<boolean> {
  clearTimeout(Proposals.timers[row.id]); proposalStatus('saving');
  try {
    if (Proposals.where === 'db') {
      const { error } = await db().from('proposals').upsert({ id: row.id, slug: row.slug, data: clone(row.data), status: row.status, expires_on: row.expires_on || null, searchable: row.searchable });
      if (error) throw error;
    } else LS.set('dorma.proposals', Proposals.rows);
    proposalStatus('saved'); return true;
  } catch (e) {
    const err = e as { code?: string; message?: string };
    proposalStatus('error', err.code === '23505' ? 'That link code is already used by another proposal.' : saveError(err)); return false;
  }
}
export async function deleteProposal(row: ProposalRow): Promise<boolean> {
  clearTimeout(Proposals.timers[row.id]);
  if (Proposals.where === 'db') { const { error } = await db().from('proposals').delete().eq('id', row.id); if (error) return false; }
  Proposals.rows = (Proposals.rows || []).filter((r) => r.id !== row.id);
  if (Proposals.where === 'local') LS.set('dorma.proposals', Proposals.rows);
  return true;
}
/** The latest opens of one proposal (newest first), for the studio. */
export async function proposalOpens(id: string): Promise<ProposalOpen[]> {
  if (Proposals.where !== 'db') return [];
  const { data } = await db().from('proposal_opens').select('opened_at, lang, device').eq('proposal_id', id).order('opened_at', { ascending: false }).limit(25);
  return (data as ProposalOpen[]) || [];
}
export async function clearProposalOpens(id: string): Promise<boolean> {
  if (Proposals.where !== 'db') return false;
  const { error } = await db().from('proposal_opens').delete().eq('proposal_id', id);
  if (!error) delete Proposals.stats[id];
  return !error;
}
export interface OpenedProposal { ok: boolean; code?: string; slug?: string; data?: Config; searchable?: boolean; status?: string; expires_on?: string | null }
/** What the site shows at #for/<code>. count = record one open (sent once per visit). */
export async function openProposal(slug: string, opts: { count?: boolean; lang?: string; device?: string } = {}): Promise<OpenedProposal> {
  if (Store.mode !== 'db') {
    const r = localProposals().find((x) => x.slug === slug);
    if (!r) return { ok: false, code: 'missing' };
    const today = new Date().toISOString().slice(0, 10);
    if (r.status !== 'live' && !Store.canEdit) return { ok: false, code: 'off' };
    if (r.expires_on && r.expires_on < today && !Store.canEdit) return { ok: false, code: 'expired' };
    return { ok: true, slug: r.slug, data: r.data, searchable: r.searchable, status: r.status, expires_on: r.expires_on };
  }
  const { data, error } = await db().rpc('open_proposal', { p_slug: slug, p_count: !!opts.count, p_lang: opts.lang || null, p_device: opts.device || null });
  if (error) return { ok: false, code: 'unreachable' };
  return (data as OpenedProposal) || { ok: false, code: 'missing' };
}

/* ---------- edge functions (studio → Write with AI) ----------
   Calls a Supabase edge function as the signed-in editor. Always resolves: app-level problems come back as
   { ok: false, code, message } so the studio can explain them in plain words. */
export interface FnReply { ok: boolean; code?: string; message?: string; [k: string]: unknown }
export async function callFunction(name: string, body: Record<string, unknown>): Promise<FnReply> {
  if (Store.mode !== 'db') return { ok: false, code: 'offline', message: 'AI writing needs the online studio (this copy saves in the browser only).' };
  if (!Store.session) return { ok: false, code: 'signed_out', message: 'Sign in to the studio to use AI writing.' };
  try {
    const { data, error } = await db().functions.invoke(name, { body });
    if (!error) return (data as FnReply) || { ok: false, code: 'empty', message: 'No answer came back. Try again.' };
    const status = (error as { context?: Response }).context?.status;
    if (status === 404) return { ok: false, code: 'not_deployed', message: 'The AI writing service is not set up on Supabase yet.' };
    if (status === 546 || status === 504) return { ok: false, code: 'gemini_down', message: 'The AI took too long to answer. Try again in a moment.' };
    return { ok: false, code: 'unreachable', message: "Couldn't reach the AI writing service. Check your connection and try again." };
  } catch {
    return { ok: false, code: 'unreachable', message: "Couldn't reach the AI writing service. Check your connection and try again." };
  }
}

/* ---------- AI archive (studio → Content → AI archive) ----------
   AI texts kept to reuse later on the site or in Social posts. Editors-only table ai_archive (migration 0004);
   offline, or until the table exists, they stay in this browser. Newest first. */
export interface ArchiveItem { id: string; created_at: string; title: string; tags: string[]; en: string; ar: string; meta: Record<string, unknown> }
const ARCH_LS = 'dorma.aiArchive';
const archLocal = (): ArchiveItem[] => (LS.get(ARCH_LS) as ArchiveItem[]) || [];
export async function listArchive(): Promise<{ items: ArchiveItem[]; where: 'db' | 'local' }> {
  if (Store.mode === 'db') {
    const { data, error } = await db().from('ai_archive').select('id, created_at, title, tags, en, ar, meta').order('created_at', { ascending: false }).limit(500);
    if (!error) return { items: (data as ArchiveItem[]) || [], where: 'db' };
  }
  return { items: archLocal(), where: 'local' };
}
export async function addArchive(item: Omit<ArchiveItem, 'id' | 'created_at'>): Promise<ArchiveItem> {
  if (Store.mode === 'db') {
    const { data, error } = await db().from('ai_archive').insert(item).select('id, created_at, title, tags, en, ar, meta').single();
    if (!error && data) return data as ArchiveItem;
    // keep it in this browser only while the table doesn't exist yet; any other problem is reported
    if (!(error && /PGRST205|42P01|does not exist|schema cache/i.test((error.code || '') + ' ' + (error.message || '')))) throw new Error(error?.message || 'Could not save to the archive.');
  }
  const it: ArchiveItem = { ...item, id: 'loc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), created_at: new Date().toISOString() };
  LS.set(ARCH_LS, [it, ...archLocal()]); return it;
}
export async function updateArchive(id: string, patch: Partial<ArchiveItem>): Promise<boolean> {
  if (Store.mode === 'db' && !id.startsWith('loc-')) {
    const { error } = await db().from('ai_archive').update(patch).eq('id', id); return !error;
  }
  LS.set(ARCH_LS, archLocal().map((x) => (x.id === id ? { ...x, ...patch } : x))); return true;
}
export async function deleteArchive(id: string): Promise<boolean> {
  if (Store.mode === 'db' && !id.startsWith('loc-')) {
    const { error } = await db().from('ai_archive').delete().eq('id', id); return !error;
  }
  LS.set(ARCH_LS, archLocal().filter((x) => x.id !== id)); return true;
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
  await db().auth.signOut(); Store.session = null; Store.canEdit = false; Store.draft = null; Social.data = null; Proposals.rows = null;
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
  if (/^for\//.test(id)) { leaveStudioText(); void renderProposal(id); return; }
  leaveStudioText(); // the studio's text size is for the studio only
  // Remember the page the editor was on, so the studio's "View site" brings them back to it.
  try { sessionStorage.setItem('dorma.lastPage', id); } catch { /* storage blocked */ }
  if (Site.preview && Store.draft) { renderSite(Store.draft, id); return; }
  renderSite(Store.live || normalize(null), id);
}

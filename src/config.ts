/**
 * Supabase connection. The publishable key is public by design: row level
 * security in supabase/migrations decides who may read and change what.
 * Dorma's project is the default; environment variables override it.
 */
const env = import.meta.env;

/** Set VITE_OFFLINE=1 to build the browser-storage-only version. */
const offline = env.VITE_OFFLINE === '1';

export const SUPABASE_URL: string = offline ? '' : env.VITE_SUPABASE_URL || 'https://uhytsroauemdkuanwdoh.supabase.co';
export const SUPABASE_ANON_KEY: string = offline ? '' : env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_16UMrxNPt2ZofQxJ0Z-zvw_7pdzdwWs';

export const online = (): boolean => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Storage bucket for uploaded images and videos (created in 0001_site_config.sql). */
export const MEDIA_BUCKET = 'media';

/**
 * Where library files live. For now they are committed to public/library/ in the GitHub repo and
 * served with the site. To move them (for example to a CDN or Supabase Storage), copy the files with
 * the same folder layout and set VITE_LIBRARY_BASE to the new address; saved settings keep working
 * because they store paths relative to this base.
 */
export const LIBRARY_BASE: string = (env.VITE_LIBRARY_BASE || `${env.BASE_URL}library/`).replace(/\/?$/, '/');

/** The GitHub repository that holds the library folder, for the studio's "Add files on GitHub" links. */
export const REPO_URL = 'https://github.com/omarhamad1974/Dorma';
export const REPO_BRANCH = 'main';

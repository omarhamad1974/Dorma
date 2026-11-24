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

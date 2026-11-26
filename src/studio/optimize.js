/* ================= PICTURE OPTIMIZING =================
   Pictures are made smaller in the browser before they are uploaded, so nothing is paid for and no server
   does the work: the longest side is capped, the file is re-encoded (WebP by default) at high quality, and
   pictures with transparency (logos) can stay PNG. The studio controls every setting (cfg.uploads), and an
   upload can always keep the original. GIFs (animation), SVGs (already vector) and videos are left as they are. */

export const UPLOAD_DEFAULTS = { optimize: true, maxSide: 2400, quality: 0.85, format: "webp", keepPng: true };
export const UPLOAD_FORMATS = [["webp", "WebP (smallest)"], ["jpeg", "JPEG"], ["same", "Same type as the original"]];
/** Storage limit per file in the Supabase bucket (0001_site_config.sql). */
export const MAX_UPLOAD_BYTES = 26214400;

export function uploadSettings(cfg) {
  const s = { ...UPLOAD_DEFAULTS, ...((cfg && cfg.uploads) || {}) };
  s.maxSide = Math.round(clamp(+s.maxSide || UPLOAD_DEFAULTS.maxSide, 320, 8000));
  s.quality = clamp(+s.quality || UPLOAD_DEFAULTS.quality, 0.4, 1);
  if (!UPLOAD_FORMATS.some(([v]) => v === s.format)) s.format = UPLOAD_DEFAULTS.format;
  s.optimize = s.optimize !== false; s.keepPng = s.keepPng !== false;
  return s;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function fmtBytes(n) {
  if (!(n >= 0)) return "";
  if (n < 1024) return n + " B";
  if (n < 1048576) return Math.round(n / 1024) + " KB";
  return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + " MB";
}

/** Which pictures are re-encoded at all. */
export function canOptimize(type) {
  return /^image\/(jpeg|png|webp|avif|bmp|heic|heif)$/i.test(type || "");
}

/** New size for a picture whose longest side must not pass maxSide (never enlarges). */
export function fitSize(w, h, maxSide) {
  const k = Math.min(1, maxSide / Math.max(w, h, 1));
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)), scaled: k < 1 };
}

/** The file type to write: transparency stays PNG when asked (or WebP, which keeps it); JPEG can't hold it. */
export function targetType(srcType, hasAlpha, s) {
  if (hasAlpha && s.keepPng) return "image/png";
  if (s.format === "webp") return "image/webp";
  if (s.format === "jpeg") return hasAlpha ? "image/png" : "image/jpeg";
  return /^image\/(jpeg|png|webp)$/i.test(srcType) ? srcType.toLowerCase() : hasAlpha ? "image/png" : "image/jpeg";
}
const EXT = { "image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png" };
export const renameFor = (name, type) => String(name || "image").replace(/\.[a-z0-9]{1,5}$/i, "") + (EXT[type] || "");

/**
 * Optimizes one file. Resolves to { file, before, after, width, height, changed, note }:
 * `file` is what to upload (the original when optimizing is off, not possible, or wouldn't save anything).
 */
export async function optimizeImage(file, settings, { keepOriginal = false } = {}) {
  const s = uploadSettings({ uploads: settings });
  const base = { file, before: file.size, after: file.size, width: 0, height: 0, changed: false, note: "" };
  if (!file.type.startsWith("image/")) return { ...base, note: "videos are uploaded as they are" };
  if (keepOriginal || !s.optimize) return { ...base, note: "original kept" };
  if (!canOptimize(file.type)) return { ...base, note: /gif/i.test(file.type) ? "GIF kept so it still moves" : /svg/i.test(file.type) ? "SVG is already sharp at any size" : "kept as it is" };
  let bmp;
  try { bmp = await decode(file); }
  catch { return { ...base, note: "this browser can't read the file, so it was kept as it is" }; }
  const srcW = bmp.width, srcH = bmp.height;
  const { w, h, scaled } = fitSize(srcW, srcH, s.maxSide);
  const canvas = drawScaled(bmp, w, h);
  if (bmp.close) bmp.close();
  const alpha = /png|webp|avif|heic|heif/i.test(file.type) && hasAlpha(canvas);
  let type = targetType(file.type, alpha, s);
  let blob = await encode(canvas, type, s.quality);
  if (blob && blob.type !== type) { // the browser can't write WebP: fall back to JPEG, or PNG for transparency
    type = alpha ? "image/png" : "image/jpeg"; blob = await encode(canvas, type, s.quality);
  }
  canvas.width = canvas.height = 0;
  if (!blob) return { ...base, note: "couldn't re-encode, so it was kept as it is" };
  if (blob.size >= file.size && !scaled) return { ...base, width: w, height: h, note: "already small, original kept" };
  if (blob.size >= file.size) return { ...base, width: srcW, height: srcH, note: "the original was smaller, so it was kept" };
  const out = new File([blob], renameFor(file.name, type), { type, lastModified: Date.now() });
  return { file: out, before: file.size, after: out.size, width: w, height: h, changed: true, note: ({ "image/webp": "WebP", "image/jpeg": "JPEG", "image/png": "PNG" }[type] || "") + (scaled ? ", resized" : "") };
}

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* try an <img> below */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.decoding = "async"; img.src = url; await img.decode();
    return Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight });
  } finally { URL.revokeObjectURL(url); }
}
/** Halves the picture in steps before the last resize, which keeps fine detail sharp on big reductions. */
function drawScaled(src, w, h) {
  let cur = src, cw = src.width, ch = src.height;
  while (cw / 2 >= w && ch / 2 >= h) {
    const c = canvasOf(Math.round(cw / 2), Math.round(ch / 2));
    c.getContext("2d").drawImage(cur, 0, 0, c.width, c.height);
    if (cur !== src) cur.width = cur.height = 0;
    cur = c; cw = c.width; ch = c.height;
  }
  const out = canvasOf(w, h), ctx = out.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(cur, 0, 0, w, h);
  if (cur !== src) cur.width = cur.height = 0;
  return out;
}
function canvasOf(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  return c;
}
function hasAlpha(canvas) {
  const d = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return true;
  return false;
}
const encode = (canvas, type, q) => new Promise(res => canvas.toBlob(b => res(b), type, type === "image/png" ? undefined : q));

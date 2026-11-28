import { describe, expect, it } from 'vitest';
import { filterEnquiries, counts, subjectOf, replyLink, toCsv, csvCell } from '../src/studio/inbox';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const rows: Any[] = [
  { id: '1', status: 'new', kind: 'contact', name: 'Sara', email: 'sara@example.com', message: 'Hello', created_at: '2026-11-28T10:00:00Z', lang: 'en' },
  { id: '2', status: 'read', kind: 'quote', name: 'Ali', email: '', phone: '+971 50 000', service: 'Packaging', message: 'Boxes', created_at: '2026-11-27T10:00:00Z' },
  { id: '3', status: 'archived', kind: 'proposal', name: 'Mona', email: 'mona@acme.com', client: 'Acme', proposal_slug: 'acme-k7p2', message: 'نريد عرضاً', created_at: '2026-11-26T10:00:00Z', lang: 'ar' },
];

describe('inbox', () => {
  it('filters by view, type and search', () => {
    expect(filterEnquiries(rows).map((e: Any) => e.id)).toEqual(['1', '2']);
    expect(filterEnquiries(rows, { view: 'new' }).map((e: Any) => e.id)).toEqual(['1']);
    expect(filterEnquiries(rows, { view: 'archived' }).map((e: Any) => e.id)).toEqual(['3']);
    expect(filterEnquiries(rows, { view: 'all', kind: 'proposal' }).map((e: Any) => e.id)).toEqual(['3']);
    expect(filterEnquiries(rows, { view: 'all', q: 'acme' }).map((e: Any) => e.id)).toEqual(['3']);
    expect(filterEnquiries(rows, { view: 'all', q: 'packaging ali' }).map((e: Any) => e.id)).toEqual(['2']);
    expect(counts(rows)).toEqual({ inbox: 2, new: 1, archived: 1, all: 3 });
  });

  it('describes each message', () => {
    expect(subjectOf(rows[0])).toBe('Contact');
    expect(subjectOf(rows[1])).toBe('Quote request · Packaging');
    expect(subjectOf(rows[2])).toBe('Quote request · proposal for Acme');
  });

  it('makes a reply link only when there is an email, in the sender language', () => {
    expect(replyLink(rows[1])).toBe('');
    const en = decodeURIComponent(replyLink(rows[0], 'Dorma'));
    expect(en).toMatch(/^mailto:sara@example\.com\?subject=Re: Contact · Dorma&body=Hello Sara,/);
    expect(en).toContain('> Hello');
    expect(decodeURIComponent(replyLink(rows[2]))).toContain('رد: ');
  });

  it('exports CSV that spreadsheets open safely', () => {
    const csv = toCsv([{ ...rows[0], message: 'Line 1\nsaid "hi", ok' }, { ...rows[1], name: '=HYPERLINK("x")' }]);
    expect(csv.startsWith('﻿Received,Status,Type,Name,Email')).toBe(true);
    expect(csv).toContain('"Line 1\nsaid ""hi"", ok"');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csvCell(null)).toBe('');
    expect(csvCell('+971')).toBe("'+971");
  });
});

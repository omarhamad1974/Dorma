import { describe, expect, it } from 'vitest';
import { connections, collectLinks } from '../src/studio/connections';
import { normalize } from '../src/studio/data';

const cfg = (): any => ({
  site: { homePage: 'home', cta: { label: 'Quote', action: { type: 'modal', target: 'md-quote' } } },
  pages: [
    { id: 'home', title: 'Home', nav: true, sections: [
      { id: 'a', type: 'hero', title: 'Hi', flowId: 'f1', button: { label: 'About', action: { type: 'page', target: 'about', section: 'team' } } },
      { id: 'b', type: 'grid', title: 'Cards', items: [{ title: 'Gone', action: { type: 'modal', target: 'nope' } }, { title: 'Empty', action: { type: 'page', target: '' } }] }] },
    { id: 'about', title: 'About', nav: false, sections: [{ id: 'c', type: 'hero', anchor: 'team' }] },
    { id: 'lost', title: 'Lost', nav: false, sections: [] }
  ],
  modals: [{ id: 'md-quote', name: 'Quote', type: 1 }, { id: 'md-alone', name: 'Alone', type: 1 }],
  flows: [{ id: 'f1', name: 'Process', items: [{ label: 'Step', action: { type: 'modal', target: 'md-quote' } }] }],
  posts: [], media: []
});

describe('site connections', () => {
  it('finds buttons, cards, flow items and flows shown by sections', () => {
    const L = collectLinks(cfg());
    const kinds = L.map((l: any) => l.kind + ':' + l.type + ':' + l.target);
    expect(kinds).toContain('Button:modal:md-quote');
    expect(kinds).toContain('Shows flow:flow:f1');
    expect(kinds).toContain('Button:page:about');
    expect(kinds).toContain('Card or item:modal:nope');
    expect(kinds).toContain('Flow item:modal:md-quote');
  });

  it('flags links that lead nowhere or have nothing chosen', () => {
    const c = connections(cfg());
    expect(c.problems.map((l: any) => l.status).sort()).toEqual(['broken', 'empty']);
  });

  it('lists what opens each page and modal, and what nothing opens', () => {
    const c = connections(cfg());
    const by = (k: string) => c.reverse.find((x: any) => x.key === k);
    expect(by('modal:md-quote').from).toHaveLength(2);
    expect(by('page:about').from[0].section).toBe('team');
    expect(by('modal:md-alone').orphan).toBe(true);
    expect(by('page:lost').orphan).toBe(true);
    expect(by('page:home').orphan).toBe(false);
  });

  it('keeps the flow items of a flow for the section that shows it', () => {
    const c = connections(cfg());
    expect(c.flowLinks.get('f1').map((l: any) => l.target)).toEqual(['md-quote']);
    expect(c.menu.map((m: any) => m.id)).toEqual(['home']);
  });

  it('runs on the starter site with no broken links', () => {
    const c = connections(normalize(null));
    expect(c.links.length).toBeGreaterThan(20);
    expect(c.problems.filter((l: any) => l.status === 'broken')).toHaveLength(0);
  });
});

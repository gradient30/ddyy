import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BADGES } from '@/data/badges';
import { AUDIO_MANIFEST } from '@/data/audio-manifest';
import { KNOWLEDGE, STATIONS } from '@/data/curriculum';
import { VOCAB } from '@/data/vocab';

const root = process.cwd();
const src = join(root, 'src');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function pageSources(): { file: string; text: string }[] {
  return readdirSync(join(src, 'pages'))
    .filter(name => name.endsWith('.tsx'))
    .map(name => ({ file: name, text: read(join('src/pages', name)) }));
}

function extractCallArgs(source: string, fn: string): string[] {
  const re = new RegExp(`${fn}\\(\\s*['"]([^'"]+)['"]`, 'g');
  return [...source.matchAll(re)].map(m => m[1]);
}

function extractPyStringList(srcText: string, name: 'ZH' | 'EN'): string[] {
  const marker = `${name}: list[str] = [`;
  const start = srcText.indexOf(marker);
  if (start < 0) throw new Error(`missing ${name} list in generate-voice.py`);
  const after = srcText.slice(start + marker.length);
  const end = after.indexOf('\n]');
  const block = after.slice(0, end);
  return [...block.matchAll(/"((?:\\.|[^"\\])*)"/g)].map(m => m[1]);
}

describe('curriculum graph', () => {
  it('keeps nine ordered stations with unique ids and paths', () => {
    expect(STATIONS).toHaveLength(9);
    expect(new Set(STATIONS.map(s => s.id)).size).toBe(9);
    expect(new Set(STATIONS.map(s => s.path)).size).toBe(9);
  });

  it('points every knowledge id at a real card', () => {
    const ids = new Set(KNOWLEDGE.map(k => k.id));
    for (const station of STATIONS) {
      expect(station.knowledgeIds.length).toBeGreaterThan(0);
      for (const id of station.knowledgeIds) {
        expect(ids.has(id), `${station.id} → ${id}`).toBe(true);
      }
    }
  });

  it('registers every station path in App.tsx', () => {
    const app = read('src/App.tsx');
    for (const station of STATIONS) {
      expect(app.includes(`path="${station.path}"`), station.path).toBe(true);
    }
  });
});

describe('page awards stay on the catalog', () => {
  const pages = pageSources();
  const stationIds = new Set(STATIONS.map(s => s.id));
  const badgeIds = new Set(BADGES.map(b => b.id));
  const knowledgeIds = new Set(KNOWLEDGE.map(k => k.id));

  it('only completes known stations', () => {
    const found = new Set<string>();
    for (const page of pages) {
      for (const id of extractCallArgs(page.text, 'completeStation')) {
        expect(stationIds.has(id), `${page.file} completeStation('${id}')`).toBe(true);
        found.add(id);
      }
    }
    expect([...stationIds].sort()).toEqual([...found].sort());
  });

  it('only awards catalog badge slugs', () => {
    for (const page of pages) {
      for (const id of extractCallArgs(page.text, 'addBadge')) {
        expect(badgeIds.has(id), `${page.file} addBadge('${id}')`).toBe(true);
      }
    }
  });

  it('only records known knowledge cards', () => {
    for (const page of pages) {
      for (const id of extractCallArgs(page.text, 'addKnowledge')) {
        expect(knowledgeIds.has(id), `${page.file} addKnowledge('${id}')`).toBe(true);
      }
    }
  });
});

describe('voice pipeline', () => {
  it('keeps every manifest file on disk', () => {
    const missing = Object.values(AUDIO_MANIFEST).filter(
      rel => !existsSync(join(root, 'public', rel)),
    );
    expect(missing).toEqual([]);
  });

  it('includes every static line from generate-voice.py', () => {
    const py = read('scripts/generate-voice.py');
    for (const text of extractPyStringList(py, 'ZH')) {
      expect(AUDIO_MANIFEST[`zh-CN|${text}`], text).toBeTruthy();
    }
    for (const text of extractPyStringList(py, 'EN')) {
      expect(AUDIO_MANIFEST[`en-US|${text}`], text).toBeTruthy();
    }
  });
});

describe('vocab stays layered', () => {
  it('does not put explorer-only words on sprout cards', () => {
    const sprout = VOCAB.filter(w => w.minBand === 'sprout').map(w => w.zh);
    expect(sprout).not.toContain('停');
    expect(sprout).toContain('红');
  });
});

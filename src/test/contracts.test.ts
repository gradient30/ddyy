import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AUDIO_MANIFEST } from '@/data/audio-manifest';
import { BADGES } from '@/data/badges';
import {
  isStationUnlocked,
  KNOWLEDGE,
  nextLockedStation,
  recommendedStation,
  STATIONS,
} from '@/data/curriculum';
import {
  allAwardBadgeIds,
  allAwardKnowledgeIds,
  EXTRA_APP_PATHS,
  knownBadgeIds,
  knownKnowledgeIds,
  knownStationIds,
  STATION_AWARDS,
} from '@/data/progress';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const src = join(root, 'src');

function collectSource(dir: string): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'ui' || name.name === 'test') continue;
      out.push(...collectSource(path));
      continue;
    }
    if (name.name.endsWith('.ts') || name.name.endsWith('.tsx')) {
      out.push({ file: path.slice(src.length + 1), text: readFileSync(path, 'utf8') });
    }
  }
  return out;
}

describe('curriculum identity', () => {
  it('keeps unique station ids, paths, and a 9-stop path', () => {
    const ids = STATIONS.map(s => s.id);
    const paths = STATIONS.map(s => s.path);
    expect(ids).toHaveLength(9);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(STATIONS[0].id).toBe('welcome');
    expect(STATIONS[STATIONS.length - 1].id).toBe('world');
  });

  it('keeps unique knowledge and badge ids', () => {
    expect(new Set(knownKnowledgeIds()).size).toBe(KNOWLEDGE.length);
    expect(new Set(knownBadgeIds()).size).toBe(BADGES.length);
  });

  it('only references real knowledge cards on stations', () => {
    const known = new Set(knownKnowledgeIds());
    for (const station of STATIONS) {
      expect(station.knowledgeIds.length).toBeGreaterThan(0);
      for (const id of station.knowledgeIds) {
        expect(known.has(id), `${station.id} → ${id}`).toBe(true);
      }
    }
  });
});

describe('progress awards', () => {
  it('covers every station exactly once', () => {
    expect(STATION_AWARDS.map(a => a.stationId).sort()).toEqual([...knownStationIds()].sort());
  });

  it('only awards catalog badges and knowledge', () => {
    const badges = new Set(knownBadgeIds());
    const knowledge = new Set(knownKnowledgeIds());
    for (const id of allAwardBadgeIds()) {
      expect(badges.has(id), `unknown badge ${id}`).toBe(true);
    }
    for (const id of allAwardKnowledgeIds()) {
      expect(knowledge.has(id), `unknown knowledge ${id}`).toBe(true);
    }
  });

  it('covers every badge in the catalog', () => {
    expect([...allAwardBadgeIds()].sort()).toEqual([...knownBadgeIds()].sort());
  });
});

describe('routes stay wired to the growth path', () => {
  const app = readFileSync(join(src, 'App.tsx'), 'utf8');

  it('registers every station path', () => {
    for (const station of STATIONS) {
      expect(app).toContain(`path="${station.path}"`);
    }
  });

  it('registers handbook, parent, and express side doors', () => {
    for (const path of EXTRA_APP_PATHS) {
      if (path === '/') {
        expect(app).toContain('path="/"');
        continue;
      }
      expect(app).toContain(`path="${path}"`);
    }
  });
});

describe('pages only complete known stations', () => {
  it('completeStation ids are on the growth path', () => {
    const known = new Set(knownStationIds());
    const found = new Set<string>();
    const re = /completeStation\(\s*['"]([a-z-]+)['"]\s*\)/g;
    for (const { file, text } of collectSource(join(src, 'pages'))) {
      for (const match of text.matchAll(re)) {
        const id = match[1];
        expect(known.has(id), `${file} completes unknown station ${id}`).toBe(true);
        found.add(id);
      }
    }
    expect([...found].sort()).toEqual([...knownStationIds()].sort());
  });

  it('addBadge ids resolve through the catalog', () => {
    const known = new Set(knownBadgeIds());
    const re = /addBadge\(\s*['"]([^'"]+)['"]\s*\)/g;
    for (const { file, text } of collectSource(join(src, 'pages'))) {
      for (const match of text.matchAll(re)) {
        expect(known.has(match[1]), `${file} awards unknown badge ${match[1]}`).toBe(true);
      }
    }
  });

  it('addKnowledge ids exist on knowledge cards', () => {
    const known = new Set(knownKnowledgeIds());
    const re = /addKnowledge\(\s*['"]([^'"]+)['"]\s*\)/g;
    for (const { file, text } of collectSource(join(src, 'pages'))) {
      for (const match of text.matchAll(re)) {
        expect(known.has(match[1]), `${file} awards unknown knowledge ${match[1]}`).toBe(true);
      }
    }
  });
});

describe('unlock helpers', () => {
  it('recommends the first unfinished unlocked station', () => {
    expect(recommendedStation([]).id).toBe('welcome');
    expect(recommendedStation(['welcome', 'observe']).id).toBe('math');
    expect(recommendedStation(STATIONS.map(s => s.id)).id).toBe('world');
  });

  it('locks the remainder of the path until the previous stop is done', () => {
    const locked = nextLockedStation(['welcome']);
    expect(locked?.id).toBe('math');
    expect(isStationUnlocked('language', ['welcome', 'observe'])).toBe(false);
    expect(nextLockedStation(STATIONS.map(s => s.id))).toBeNull();
  });
});

describe('recorded voice clips', () => {
  it('points at files that exist under public/', () => {
    const missing = Object.entries(AUDIO_MANIFEST)
      .filter(([, file]) => !existsSync(join(root, 'public', file)))
      .map(([key, file]) => `${key} → ${file}`);
    expect(missing).toEqual([]);
  });
});

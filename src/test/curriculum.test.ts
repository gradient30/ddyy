import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasBadge, normalizeBadgeId } from '@/data/badges';
import { isStationUnlocked, recommendedStation, STATIONS } from '@/data/curriculum';
import { vocabForBand } from '@/data/vocab';

describe('badge contract', () => {
  it('maps old award strings to catalog ids', () => {
    expect(normalizeBadgeId('🌍 环球小旅行家')).toBe('world-traveler');
    expect(normalizeBadgeId('🏗️ 小小工程师')).toBe('engineer');
    expect(normalizeBadgeId('交通小英雄')).toBe('safety-guard');
    expect(hasBadge(['🌍 环球小旅行家'], 'world-traveler')).toBe(true);
  });
});

describe('growth path unlock', () => {
  it('keeps the first station open', () => {
    expect(isStationUnlocked('welcome', [])).toBe(true);
    expect(isStationUnlocked('observe', [])).toBe(false);
  });

  it('opens the next station after the previous is done', () => {
    expect(isStationUnlocked('observe', ['welcome'])).toBe(true);
    expect(isStationUnlocked('math', ['welcome'])).toBe(false);
    expect(recommendedStation(['welcome']).id).toBe('observe');
  });

  it('can unlock everything for parents', () => {
    expect(isStationUnlocked('world', [], true)).toBe(true);
    expect(STATIONS).toHaveLength(9);
  });
});

describe('age-layered vocabulary', () => {
  it('gives sprouts colors and shapes only', () => {
    const words = vocabForBand('sprout');
    expect(words.every(w => ['颜色', '形状', '大小'].includes(w.category))).toBe(true);
    expect(words.some(w => w.zh === '停')).toBe(false);
  });

  it('adds safety words for explorers', () => {
    expect(vocabForBand('explorer').some(w => w.zh === '停')).toBe(true);
  });
});

describe('science facts used in copy', () => {
  it('teaches effort farther from fulcrum, not load farther', () => {
    const src = readFileSync(join(process.cwd(), 'src/pages/LabPage.tsx'), 'utf8');
    expect(src).toMatch(/推的地方离支点越远/);
    expect(src).not.toMatch(/重物离支点越远，抬起来越省力/);
  });
});

describe('sensor safety demo', () => {
  it('keeps the arm up when the beam is blocked', async () => {
    const { barrierRaisedForSensor } = await import('@/lib/science');
    expect(barrierRaisedForSensor(true, false)).toBe(true);
    expect(barrierRaisedForSensor(true, true)).toBe(true);
    expect(barrierRaisedForSensor(false, false)).toBe(false);
    expect(barrierRaisedForSensor(false, true)).toBe(true);
  });
});

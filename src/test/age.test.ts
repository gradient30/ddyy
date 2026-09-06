import { describe, expect, it } from 'vitest';
import { AGE_CONFIGS, getAgeConfig, type AgeBand } from '@/data/age';
import { getAdaptiveDifficulty, getDifficulty, getEncouragement } from '@/lib/difficulty';
import { unitsForBand, vocabForBand } from '@/data/vocab';

const BANDS: AgeBand[] = ['sprout', 'explorer', 'builder'];

describe('age bands', () => {
  it('defaults missing profiles to explorer', () => {
    expect(getAgeConfig(undefined).id).toBe('explorer');
    expect(getAgeConfig(null).id).toBe('explorer');
  });

  it('widens choices and counts as children grow', () => {
    expect(AGE_CONFIGS.sprout.optionCount).toBeLessThan(AGE_CONFIGS.explorer.optionCount);
    expect(AGE_CONFIGS.explorer.optionCount).toBeLessThan(AGE_CONFIGS.builder.optionCount);
    expect(AGE_CONFIGS.sprout.maxCount).toBe(5);
    expect(AGE_CONFIGS.explorer.maxCount).toBe(10);
    expect(AGE_CONFIGS.builder.maxCount).toBe(20);
  });

  it('keeps spelling, driving, and add-subtract on the builder band only', () => {
    expect(AGE_CONFIGS.sprout.allowSpell).toBe(false);
    expect(AGE_CONFIGS.explorer.allowSpell).toBe(false);
    expect(AGE_CONFIGS.builder.allowSpell).toBe(true);
    expect(AGE_CONFIGS.builder.allowDriving).toBe(true);
    expect(AGE_CONFIGS.builder.allowAddSubtract).toBe(true);
    expect(AGE_CONFIGS.sprout.showEnglish).toBe(false);
  });

  it('grows world and traffic exposure with the band', () => {
    expect(AGE_CONFIGS.sprout.maxWorldCountries).toBe(5);
    expect(AGE_CONFIGS.explorer.maxWorldCountries).toBe(10);
    expect(AGE_CONFIGS.builder.maxWorldCountries).toBe(15);
    expect(AGE_CONFIGS.sprout.maxTrafficLevels).toBeLessThan(AGE_CONFIGS.explorer.maxTrafficLevels);
    expect(AGE_CONFIGS.explorer.maxTrafficLevels).toBeLessThan(AGE_CONFIGS.builder.maxTrafficLevels);
  });

  it('opens more vocab units for older bands', () => {
    expect(vocabForBand('sprout').length).toBeLessThan(vocabForBand('explorer').length);
    expect(vocabForBand('explorer').length).toBeLessThanOrEqual(vocabForBand('builder').length);
    expect(unitsForBand('sprout').every(u => BANDS.indexOf(u.minBand) === 0)).toBe(true);
    expect(unitsForBand('builder').some(u => u.id === 'safety')).toBe(true);
  });
});

describe('adaptive difficulty helpers', () => {
  it('maps success rate to a preset', () => {
    expect(getDifficulty(10).level).toBe('easy');
    expect(getDifficulty(50).level).toBe('medium');
    expect(getDifficulty(90).level).toBe('hard');
  });

  it('steps down after three misses and up after five hits', () => {
    expect(getAdaptiveDifficulty('hard', 0, 3)).toBe('medium');
    expect(getAdaptiveDifficulty('medium', 0, 3)).toBe('easy');
    expect(getAdaptiveDifficulty('easy', 5, 0)).toBe('medium');
    expect(getAdaptiveDifficulty('medium', 5, 0)).toBe('hard');
    expect(getAdaptiveDifficulty('medium', 1, 1)).toBe('medium');
  });

  it('always returns a short encouragement line', () => {
    expect(getEncouragement(true, 1).length).toBeGreaterThan(0);
    expect(getEncouragement(true, 5)).toContain('小天才');
    expect(getEncouragement(false, 0).length).toBeGreaterThan(0);
  });
});

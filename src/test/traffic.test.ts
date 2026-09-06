import { describe, expect, it } from 'vitest';
import { AGE_CONFIGS } from '@/data/age';
import {
  carOverlapsSpot,
  isCorrectLightAction,
  maxSafetyLevels,
  pickTrafficLight,
  safetyStationCleared,
} from '@/lib/traffic';

describe('traffic light rule', () => {
  it('only accepts red-stop and green-go', () => {
    expect(isCorrectLightAction('red', 'stop')).toBe(true);
    expect(isCorrectLightAction('green', 'go')).toBe(true);
    expect(isCorrectLightAction('red', 'go')).toBe(false);
    expect(isCorrectLightAction('green', 'stop')).toBe(false);
  });

  it('picks only red or green', () => {
    expect(pickTrafficLight(0.1)).toBe('red');
    expect(pickTrafficLight(0.9)).toBe('green');
  });
});

describe('safety station completion', () => {
  it('uses the age table, not a second copy of the counts', () => {
    expect(maxSafetyLevels('sprout')).toBe(AGE_CONFIGS.sprout.maxTrafficLevels);
    expect(maxSafetyLevels('explorer')).toBe(AGE_CONFIGS.explorer.maxTrafficLevels);
    expect(maxSafetyLevels('builder')).toBe(AGE_CONFIGS.builder.maxTrafficLevels);
  });

  it('clears the station when the age-band levels are done', () => {
    expect(safetyStationCleared(2, 2)).toBe(true);
    expect(safetyStationCleared(1, 2)).toBe(false);
    expect(safetyStationCleared(4, 4)).toBe(true);
    expect(safetyStationCleared(5, 5)).toBe(true);
  });

  it('counts a car as parked when it overlaps the spot', () => {
    expect(carOverlapsSpot({ left: 200, right: 260 }, { left: 240, right: 320 })).toBe(true);
    expect(carOverlapsSpot({ left: 40, right: 90 }, { left: 240, right: 320 })).toBe(false);
  });
});

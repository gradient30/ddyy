import { beforeEach, describe, expect, it } from 'vitest';
import { getAudioFlags, setAudioFlags } from '@/lib/audio-flags';
import {
  addBadge,
  addKnowledge,
  addLearnedWord,
  addStars,
  completeStation,
  getCurrentProfile,
  loadGameState,
  saveGameState,
} from '@/lib/storage';

describe('storage migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fills new fields when loading a legacy save', () => {
    localStorage.setItem('barrier-buddies-data', JSON.stringify({
      currentProfileId: 1,
      profiles: [{
        id: 1,
        name: '宝宝1',
        avatar: '🦁',
        stars: 4,
        badges: ['🌍 环球小旅行家'],
        learnedWords: ['车'],
        buildSuccessRate: 0,
        totalPlayMinutes: 0,
        createdAt: '2026-01-01',
        lastPlayedAt: '2026-01-01',
        settings: { language: 'both', voiceSpeed: 0.8, restDuration: 10 },
      }],
      globalSettings: { soundEnabled: true, voiceEnabled: true, vibrationEnabled: true, highContrast: false, timerEnabled: true },
    }));

    const state = loadGameState();
    expect(state.profiles[0].ageBand).toBe('explorer');
    expect(state.profiles[0].completedStations).toEqual([]);
    expect(state.profiles[0].badges).toEqual(['world-traveler']);
    expect(state.globalSettings.unlockAllStations).toBe(false);
  });

  it('normalizes badges when awarding', () => {
    saveGameState(loadGameState());
    const fresh = loadGameState();
    const withCurrent = { ...fresh, currentProfileId: 1 };
    const next = addBadge(withCurrent, '语言小达人');
    expect(next.profiles[0].badges).toContain('linguist');
  });

  it('writes progress only on the current child and stays idempotent', () => {
    const withCurrent = { ...loadGameState(), currentProfileId: 1 };
    const once = completeStation(
      addKnowledge(addStars(addLearnedWord(withCurrent, '红'), 3), 'count-5'),
      'math',
    );
    const twice = completeStation(addKnowledge(addLearnedWord(once, '红'), 'count-5'), 'math');
    const child = getCurrentProfile(twice);
    expect(child?.stars).toBe(3);
    expect(child?.learnedWords).toEqual(['红']);
    expect(child?.knowledgeIds).toEqual(['count-5']);
    expect(child?.completedStations).toEqual(['math']);
    expect(twice.profiles[1].stars).toBe(0);
  });

  it('does not invent a child when nobody is selected', () => {
    const idle = loadGameState();
    const next = completeStation(addStars(idle, 9), 'welcome');
    expect(next.currentProfileId).toBeNull();
    expect(next.profiles.every(p => p.stars === 0 && p.completedStations.length === 0)).toBe(true);
  });

  it('recovers from broken JSON', () => {
    localStorage.setItem('barrier-buddies-data', '{not-json');
    const state = loadGameState();
    expect(state.profiles).toHaveLength(3);
    expect(state.currentProfileId).toBeNull();
  });
});

describe('audio flags', () => {
  it('can mute voice and sound', () => {
    setAudioFlags({ voice: false, sound: false, vibrate: false });
    expect(getAudioFlags()).toEqual({ voice: false, sound: false, vibrate: false });
    setAudioFlags({ voice: true, sound: true, vibrate: true });
  });
});

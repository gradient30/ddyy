import { beforeEach, describe, expect, it } from 'vitest';
import { addBadge, loadGameState, saveGameState } from '@/lib/storage';
import { getAudioFlags, setAudioFlags } from '@/lib/audio-flags';

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
});

describe('audio flags', () => {
  it('can mute voice and sound', () => {
    setAudioFlags({ voice: false, sound: false, vibrate: false });
    expect(getAudioFlags()).toEqual({ voice: false, sound: false, vibrate: false });
    setAudioFlags({ voice: true, sound: true, vibrate: true });
  });
});

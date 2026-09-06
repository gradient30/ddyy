import type { AgeBand } from '@/data/age';
import { normalizeBadgeId } from '@/data/badges';

export interface ChildProfile {
  id: number;
  name: string;
  avatar: string;
  stars: number;
  badges: string[];
  learnedWords: string[];
  buildSuccessRate: number;
  totalPlayMinutes: number;
  createdAt: string;
  lastPlayedAt: string;
  ageBand: AgeBand;
  ageChosen: boolean;
  completedStations: string[];
  knowledgeIds: string[];
  settings: {
    language: 'zh' | 'en' | 'both';
    voiceSpeed: number;
    restDuration: number;
  };
}

export interface GameState {
  currentProfileId: number | null;
  profiles: ChildProfile[];
  globalSettings: {
    soundEnabled: boolean;
    voiceEnabled: boolean;
    vibrationEnabled: boolean;
    highContrast: boolean;
    timerEnabled: boolean;
    unlockAllStations: boolean;
  };
}

const STORAGE_KEY = 'barrier-buddies-data';

const defaultSettings = (): ChildProfile['settings'] => ({
  language: 'both',
  voiceSpeed: 0.8,
  restDuration: 10,
});

const defaultProfile = (id: number): ChildProfile => ({
  id,
  name: id === 1 ? '小狮' : id === 2 ? '小兔' : '小熊',
  avatar: id === 1 ? '🦁' : id === 2 ? '🐰' : '🐻',
  stars: 0,
  badges: [],
  learnedWords: [],
  buildSuccessRate: 0,
  totalPlayMinutes: 0,
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  ageBand: 'explorer',
  ageChosen: false,
  completedStations: [],
  knowledgeIds: [],
  settings: defaultSettings(),
});

const defaultState = (): GameState => ({
  currentProfileId: null,
  profiles: [defaultProfile(1), defaultProfile(2), defaultProfile(3)],
  globalSettings: {
    soundEnabled: true,
    voiceEnabled: true,
    vibrationEnabled: true,
    highContrast: false,
    timerEnabled: true,
    unlockAllStations: false,
  },
});

function migrateProfile(raw: Partial<ChildProfile> & { id: number }): ChildProfile {
  const base = defaultProfile(raw.id);
  return {
    ...base,
    ...raw,
    name: raw.name ?? base.name,
    avatar: raw.avatar ?? base.avatar,
    ageBand: raw.ageBand ?? 'explorer',
    ageChosen: raw.ageChosen ?? false,
    completedStations: raw.completedStations ?? [],
    knowledgeIds: raw.knowledgeIds ?? [],
    badges: (raw.badges ?? []).map(normalizeBadgeId),
    settings: { ...defaultSettings(), ...raw.settings },
  };
}

export function loadGameState(): GameState {
  const fallback = defaultState();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return fallback;
    const parsed = JSON.parse(data) as Partial<GameState>;
    const profiles = (parsed.profiles?.length ? parsed.profiles : fallback.profiles)
      .map((p, i) => migrateProfile({ ...p, id: p.id ?? i + 1 }));
    return {
      currentProfileId: parsed.currentProfileId ?? null,
      profiles,
      globalSettings: { ...fallback.globalSettings, ...parsed.globalSettings },
    };
  } catch {
    return fallback;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

function updateCurrentProfile(
  state: GameState,
  updater: (profile: ChildProfile) => ChildProfile,
): GameState {
  if (state.currentProfileId === null) return state;
  const profiles = state.profiles.map(p =>
    p.id === state.currentProfileId ? updater(p) : p,
  );
  const next = { ...state, profiles };
  saveGameState(next);
  return next;
}

export function addStars(state: GameState, count: number): GameState {
  return updateCurrentProfile(state, p => ({ ...p, stars: p.stars + count }));
}

export function addBadge(state: GameState, badge: string): GameState {
  const id = normalizeBadgeId(badge);
  return updateCurrentProfile(state, p => (
    p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id] }
  ));
}

export function addLearnedWord(state: GameState, word: string): GameState {
  return updateCurrentProfile(state, p => (
    p.learnedWords.includes(word) ? p : { ...p, learnedWords: [...p.learnedWords, word] }
  ));
}

export function addKnowledge(state: GameState, knowledgeId: string): GameState {
  return updateCurrentProfile(state, p => (
    p.knowledgeIds.includes(knowledgeId) ? p : { ...p, knowledgeIds: [...p.knowledgeIds, knowledgeId] }
  ));
}

export function completeStation(state: GameState, stationId: string): GameState {
  return updateCurrentProfile(state, p => (
    p.completedStations.includes(stationId)
      ? p
      : { ...p, completedStations: [...p.completedStations, stationId] }
  ));
}

export function getCurrentProfile(state: GameState): ChildProfile | null {
  if (state.currentProfileId === null) return null;
  return state.profiles.find(p => p.id === state.currentProfileId) || null;
}

// 道闸乐园 - localStorage 数据管理

export interface ChildProfile {
  id: number;
  name: string;
  avatar: string; // emoji
  stars: number;
  badges: string[];
  learnedWords: string[];
  buildSuccessRate: number;
  totalPlayMinutes: number;
  createdAt: string;
  lastPlayedAt: string;
  settings: {
    language: 'zh' | 'en' | 'both';
    voiceSpeed: number;
    restDuration: number; // minutes
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
  };
}

const STORAGE_KEY = 'barrier-buddies-data';

const defaultProfile = (id: number): ChildProfile => ({
  id,
  name: id === 1 ? '宝宝1' : id === 2 ? '宝宝2' : '宝宝3',
  avatar: id === 1 ? '🦁' : id === 2 ? '🐰' : '🐻',
  stars: 0,
  badges: [],
  learnedWords: [],
  buildSuccessRate: 0,
  totalPlayMinutes: 0,
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  settings: {
    language: 'both',
    voiceSpeed: 0.8,
    restDuration: 10,
  },
});

const defaultState: GameState = {
  currentProfileId: null,
  profiles: [defaultProfile(1), defaultProfile(2), defaultProfile(3)],
  globalSettings: {
    soundEnabled: true,
    voiceEnabled: true,
    vibrationEnabled: true,
    highContrast: false,
    timerEnabled: true,
  },
};

export function loadGameState(): GameState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { ...defaultState };
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function addStars(state: GameState, count: number): GameState {
  if (state.currentProfileId === null) return state;
  const profiles = state.profiles.map(p =>
    p.id === state.currentProfileId ? { ...p, stars: p.stars + count } : p
  );
  const newState = { ...state, profiles };
  saveGameState(newState);
  return newState;
}

export function addBadge(state: GameState, badge: string): GameState {
  if (state.currentProfileId === null) return state;
  const profiles = state.profiles.map(p =>
    p.id === state.currentProfileId && !p.badges.includes(badge)
      ? { ...p, badges: [...p.badges, badge] }
      : p
  );
  const newState = { ...state, profiles };
  saveGameState(newState);
  return newState;
}

export function addLearnedWord(state: GameState, word: string): GameState {
  if (state.currentProfileId === null) return state;
  const profiles = state.profiles.map(p =>
    p.id === state.currentProfileId && !p.learnedWords.includes(word)
      ? { ...p, learnedWords: [...p.learnedWords, word] }
      : p
  );
  const newState = { ...state, profiles };
  saveGameState(newState);
  return newState;
}

export function getCurrentProfile(state: GameState): ChildProfile | null {
  if (state.currentProfileId === null) return null;
  return state.profiles.find(p => p.id === state.currentProfileId) || null;
}

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AgeBand } from '@/data/age';
import { getAgeConfig } from '@/data/age';
import { setAudioFlags } from '@/lib/audio-flags';
import { setSpeechDefaults } from '@/lib/speech';
import {
  GameState,
  loadGameState,
  saveGameState,
  addStars as addStarsUtil,
  addBadge as addBadgeUtil,
  addLearnedWord as addLearnedWordUtil,
  addKnowledge as addKnowledgeUtil,
  completeStation as completeStationUtil,
  getCurrentProfile,
  ChildProfile,
} from '@/lib/storage';

interface GameContextType {
  state: GameState;
  currentProfile: ChildProfile | null;
  selectProfile: (id: number) => void;
  logout: () => void;
  addStars: (count: number) => void;
  addBadge: (badge: string) => void;
  addLearnedWord: (word: string) => void;
  addKnowledge: (id: string) => void;
  completeStation: (id: string) => void;
  updateSettings: (settings: Partial<GameState['globalSettings']>) => void;
  updateAgeBand: (band: AgeBand) => void;
  timerSeconds: number;
  isResting: boolean;
  restSeconds: number;
  startTimer: () => void;
  resetTimer: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

function syncAudioFlags(settings: GameState['globalSettings']) {
  setAudioFlags({
    sound: settings.soundEnabled,
    voice: settings.voiceEnabled,
    vibrate: settings.vibrationEnabled,
  });
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    const loaded = loadGameState();
    syncAudioFlags(loaded.globalSettings);
    return loaded;
  });
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PLAY_DURATION = 15 * 60;
  const REST_DURATION = 10 * 60;

  const currentProfile = getCurrentProfile(state);

  useEffect(() => {
    const age = getAgeConfig(currentProfile?.ageBand);
    const speed = currentProfile?.settings.voiceSpeed ?? age.speechRate;
    setSpeechDefaults({ rate: Math.min(speed, 0.82) });
  }, [currentProfile]);

  const selectProfile = useCallback((id: number) => {
    setState(prev => {
      const profiles = prev.profiles.map(p =>
        p.id === id ? { ...p, lastPlayedAt: new Date().toISOString() } : p,
      );
      const next = { ...prev, currentProfileId: id, profiles };
      saveGameState(next);
      return next;
    });
    setTimerSeconds(0);
  }, []);

  const logout = useCallback(() => {
    setState(prev => {
      const next = { ...prev, currentProfileId: null };
      saveGameState(next);
      return next;
    });
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(0);
    setIsResting(false);
  }, []);

  const addStars = useCallback((count: number) => {
    setState(prev => addStarsUtil(prev, count));
  }, []);

  const addBadge = useCallback((badge: string) => {
    setState(prev => addBadgeUtil(prev, badge));
  }, []);

  const addLearnedWord = useCallback((word: string) => {
    setState(prev => addLearnedWordUtil(prev, word));
  }, []);

  const addKnowledge = useCallback((id: string) => {
    setState(prev => addKnowledgeUtil(prev, id));
  }, []);

  const completeStationFn = useCallback((id: string) => {
    setState(prev => completeStationUtil(prev, id));
  }, []);

  const updateSettings = useCallback((settings: Partial<GameState['globalSettings']>) => {
    setState(prev => {
      const globalSettings = { ...prev.globalSettings, ...settings };
      syncAudioFlags(globalSettings);
      const next = { ...prev, globalSettings };
      saveGameState(next);
      return next;
    });
  }, []);

  const updateAgeBand = useCallback((band: AgeBand) => {
    setState(prev => {
      if (prev.currentProfileId === null) return prev;
      const profiles = prev.profiles.map(p =>
        p.id === prev.currentProfileId ? { ...p, ageBand: band, ageChosen: true } : p,
      );
      const next = { ...prev, profiles };
      saveGameState(next);
      return next;
    });
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(0);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev >= PLAY_DURATION - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsResting(true);
          setRestSeconds(REST_DURATION);
          return PLAY_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerSeconds(0);
    setIsResting(false);
    setRestSeconds(0);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (isResting) {
      restRef.current = setInterval(() => {
        setRestSeconds(prev => {
          if (prev <= 1) {
            if (restRef.current) clearInterval(restRef.current);
            setIsResting(false);
            resetTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [isResting, resetTimer]);

  useEffect(() => {
    if (state.currentProfileId !== null && state.globalSettings.timerEnabled) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.currentProfileId, state.globalSettings.timerEnabled]);

  return (
    <GameContext.Provider value={{
      state, currentProfile, selectProfile, logout,
      addStars, addBadge, addLearnedWord, addKnowledge,
      completeStation: completeStationFn, updateSettings, updateAgeBand,
      timerSeconds, isResting, restSeconds, startTimer, resetTimer,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

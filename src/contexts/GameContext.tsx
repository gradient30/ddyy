import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GameState, loadGameState, saveGameState, addStars as addStarsUtil, addBadge as addBadgeUtil, addLearnedWord as addLearnedWordUtil, getCurrentProfile, ChildProfile } from '@/lib/storage';

interface GameContextType {
  state: GameState;
  currentProfile: ChildProfile | null;
  selectProfile: (id: number) => void;
  logout: () => void;
  addStars: (count: number) => void;
  addBadge: (badge: string) => void;
  addLearnedWord: (word: string) => void;
  updateSettings: (settings: Partial<GameState['globalSettings']>) => void;
  // Timer
  timerSeconds: number;
  isResting: boolean;
  restSeconds: number;
  startTimer: () => void;
  resetTimer: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(loadGameState);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PLAY_DURATION = 15 * 60; // 15 minutes
  const REST_DURATION = 10 * 60; // 10 minutes

  const currentProfile = getCurrentProfile(state);

  const selectProfile = useCallback((id: number) => {
    const newState = { ...state, currentProfileId: id };
    setState(newState);
    saveGameState(newState);
    setTimerSeconds(0);
  }, [state]);

  const logout = useCallback(() => {
    const newState = { ...state, currentProfileId: null };
    setState(newState);
    saveGameState(newState);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(0);
    setIsResting(false);
  }, [state]);

  const addStars = useCallback((count: number) => {
    setState(prev => addStarsUtil(prev, count));
  }, []);

  const addBadge = useCallback((badge: string) => {
    setState(prev => addBadgeUtil(prev, badge));
  }, []);

  const addLearnedWord = useCallback((word: string) => {
    setState(prev => addLearnedWordUtil(prev, word));
  }, []);

  const updateSettings = useCallback((settings: Partial<GameState['globalSettings']>) => {
    setState(prev => {
      const newState = { ...prev, globalSettings: { ...prev.globalSettings, ...settings } };
      saveGameState(newState);
      return newState;
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

  // Rest countdown
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

  // Start timer when profile selected
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
      addStars, addBadge, addLearnedWord, updateSettings,
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

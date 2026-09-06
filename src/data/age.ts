export type AgeBand = 'sprout' | 'explorer' | 'builder';

export interface AgeConfig {
  id: AgeBand;
  label: string;
  years: string;
  yearsRange: [number, number];
  tagline: string;
  optionCount: number;
  maxCount: number;
  showEnglish: boolean;
  speechRate: number;
  maxTrafficLevels: number;
  maxWorldCountries: number;
  maxTreasureLevels: number;
  allowSpell: boolean;
  allowDriving: boolean;
  allowAddSubtract: boolean;
}

export const AGE_CONFIGS: Record<AgeBand, AgeConfig> = {
  sprout: {
    id: 'sprout',
    label: '萌芽',
    years: '4–5岁',
    yearsRange: [4, 5],
    tagline: '看一看、点一点、听一听',
    optionCount: 2,
    maxCount: 5,
    showEnglish: false,
    speechRate: 0.75,
    maxTrafficLevels: 2,
    maxWorldCountries: 5,
    maxTreasureLevels: 2,
    allowSpell: false,
    allowDriving: false,
    allowAddSubtract: false,
  },
  explorer: {
    id: 'explorer',
    label: '探索',
    years: '5–6岁',
    yearsRange: [5, 6],
    tagline: '想一想、比一比、说一说',
    optionCount: 3,
    maxCount: 10,
    showEnglish: true,
    speechRate: 0.85,
    maxTrafficLevels: 4,
    maxWorldCountries: 10,
    maxTreasureLevels: 4,
    allowSpell: false,
    allowDriving: false,
    allowAddSubtract: false,
  },
  builder: {
    id: 'builder',
    label: '建构',
    years: '6–7岁',
    yearsRange: [6, 7],
    tagline: '问为什么，自己试一试',
    optionCount: 4,
    maxCount: 20,
    showEnglish: true,
    speechRate: 0.9,
    maxTrafficLevels: 5,
    maxWorldCountries: 15,
    maxTreasureLevels: 5,
    allowSpell: true,
    allowDriving: true,
    allowAddSubtract: true,
  },
};

export function getAgeConfig(band: AgeBand | undefined | null): AgeConfig {
  return AGE_CONFIGS[band ?? 'explorer'];
}

import { BADGES } from './badges';
import { KNOWLEDGE, STATIONS } from './curriculum';

/** 站点通关后可能颁发的徽章与本领。页面可以只发子集，但不能发表外 id。 */
export interface StationAward {
  stationId: string;
  badges: string[];
  knowledgeIds: string[];
}

export const STATION_AWARDS: StationAward[] = [
  { stationId: 'welcome', badges: ['welcome-friend'], knowledgeIds: ['greet-friend'] },
  { stationId: 'observe', badges: ['observer'], knowledgeIds: ['observe-find'] },
  {
    stationId: 'math',
    badges: ['number-friend'],
    knowledgeIds: ['count-5', 'count-10', 'compare', 'shapes', 'pattern', 'add-subtract'],
  },
  {
    stationId: 'language',
    badges: ['linguist'],
    knowledgeIds: ['colors', 'opposites', 'safety-words'],
  },
  {
    stationId: 'safety',
    badges: ['safety-guard'],
    knowledgeIds: ['park-safe', 'stop-go', 'crosswalk'],
  },
  {
    stationId: 'science',
    badges: ['scientist'],
    knowledgeIds: ['lever', 'solar', 'sensor'],
  },
  {
    stationId: 'engineer',
    badges: ['engineer', 'creative-builder'],
    knowledgeIds: ['assemble'],
  },
  {
    stationId: 'express',
    badges: ['artist', 'musician', 'storyteller'],
    knowledgeIds: ['express-color', 'express-beat', 'story-choice'],
  },
  {
    stationId: 'world',
    badges: ['world-traveler'],
    knowledgeIds: ['world-same-different'],
  },
];

/** 成长小路以外的应用路由（表达子站、手册、家长区） */
export const EXTRA_APP_PATHS = [
  '/',
  '/coloring',
  '/music',
  '/story',
  '/collection',
  '/parent',
] as const;

export function awardForStation(stationId: string): StationAward | undefined {
  return STATION_AWARDS.find(a => a.stationId === stationId);
}

export function allAwardBadgeIds(): string[] {
  return [...new Set(STATION_AWARDS.flatMap(a => a.badges))];
}

export function allAwardKnowledgeIds(): string[] {
  return [...new Set(STATION_AWARDS.flatMap(a => a.knowledgeIds))];
}

export function knownBadgeIds(): string[] {
  return BADGES.map(b => b.id);
}

export function knownKnowledgeIds(): string[] {
  return KNOWLEDGE.map(k => k.id);
}

export function knownStationIds(): string[] {
  return STATIONS.map(s => s.id);
}

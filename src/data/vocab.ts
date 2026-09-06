import type { AgeBand } from './age';

export interface Word {
  zh: string;
  en: string;
  pinyin: string;
  emoji: string;
  category: '颜色' | '形状' | '大小' | '方位' | '动作' | '交通';
  minBand: AgeBand;
}

const BAND_RANK: Record<AgeBand, number> = { sprout: 0, explorer: 1, builder: 2 };

export const VOCAB: Word[] = [
  { zh: '红', en: 'red', pinyin: 'hóng', emoji: '🍎', category: '颜色', minBand: 'sprout' },
  { zh: '绿', en: 'green', pinyin: 'lǜ', emoji: '🌿', category: '颜色', minBand: 'sprout' },
  { zh: '黄', en: 'yellow', pinyin: 'huáng', emoji: '🌻', category: '颜色', minBand: 'sprout' },
  { zh: '蓝', en: 'blue', pinyin: 'lán', emoji: '💧', category: '颜色', minBand: 'sprout' },
  { zh: '圆', en: 'circle', pinyin: 'yuán', emoji: '⚪', category: '形状', minBand: 'sprout' },
  { zh: '方', en: 'square', pinyin: 'fāng', emoji: '⬜', category: '形状', minBand: 'sprout' },
  { zh: '大', en: 'big', pinyin: 'dà', emoji: '🐘', category: '大小', minBand: 'sprout' },
  { zh: '小', en: 'small', pinyin: 'xiǎo', emoji: '🐭', category: '大小', minBand: 'sprout' },
  { zh: '上', en: 'up', pinyin: 'shàng', emoji: '⬆️', category: '方位', minBand: 'explorer' },
  { zh: '下', en: 'down', pinyin: 'xià', emoji: '⬇️', category: '方位', minBand: 'explorer' },
  { zh: '开', en: 'open', pinyin: 'kāi', emoji: '📖', category: '动作', minBand: 'explorer' },
  { zh: '关', en: 'close', pinyin: 'guān', emoji: '📕', category: '动作', minBand: 'explorer' },
  { zh: '停', en: 'stop', pinyin: 'tíng', emoji: '🛑', category: '交通', minBand: 'explorer' },
  { zh: '行', en: 'go', pinyin: 'xíng', emoji: '🚶', category: '交通', minBand: 'explorer' },
  { zh: '车', en: 'car', pinyin: 'chē', emoji: '🚗', category: '交通', minBand: 'explorer' },
  { zh: '门', en: 'gate', pinyin: 'mén', emoji: '🚪', category: '交通', minBand: 'explorer' },
  { zh: '安全', en: 'safe', pinyin: 'ān quán', emoji: '🛡️', category: '交通', minBand: 'builder' },
  { zh: '太阳', en: 'sun', pinyin: 'tài yáng', emoji: '☀️', category: '交通', minBand: 'builder' },
];

export const VOCAB_UNITS: { id: string; name: string; categories: Word['category'][]; minBand: AgeBand }[] = [
  { id: 'colors-shapes', name: '颜色和形状', categories: ['颜色', '形状'], minBand: 'sprout' },
  { id: 'size-space', name: '大和小', categories: ['大小'], minBand: 'sprout' },
  { id: 'space', name: '上和下', categories: ['方位'], minBand: 'explorer' },
  { id: 'actions', name: '开和关', categories: ['动作'], minBand: 'explorer' },
  { id: 'safety', name: '安全用语', categories: ['交通'], minBand: 'explorer' },
];

export function vocabForBand(band: AgeBand): Word[] {
  const rank = BAND_RANK[band];
  return VOCAB.filter(w => BAND_RANK[w.minBand] <= rank);
}

export function unitsForBand(band: AgeBand) {
  const rank = BAND_RANK[band];
  return VOCAB_UNITS.filter(u => BAND_RANK[u.minBand] <= rank);
}

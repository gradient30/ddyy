export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  aliases: string[];
}

export const BADGES: BadgeDef[] = [
  { id: 'welcome-friend', name: '小闸闸的朋友', emoji: '👋', desc: '认识小闸闸，开始成长小路', aliases: [] },
  { id: 'observer', name: '观察小能手', emoji: '👀', desc: '完成观察花园的寻找与归类', aliases: ['寻宝大师', '寻宝达人'] },
  { id: 'number-friend', name: '数感小伙伴', emoji: '🔢', desc: '完成数感小岛的分层练习', aliases: [] },
  { id: 'linguist', name: '语言小达人', emoji: '📖', desc: '按主题学会一组生活词汇', aliases: ['语言小达人'] },
  { id: 'safety-guard', name: '安全小卫士', emoji: '🛡️', desc: '学会红灯停、绿灯行', aliases: ['交通小英雄', '安全小卫士'] },
  { id: 'scientist', name: '小小科学家', emoji: '🔬', desc: '先猜测，再动手验证', aliases: ['小小科学家', '小科学家'] },
  { id: 'engineer', name: '小小工程师', emoji: '🔧', desc: '按步骤装好一座道闸', aliases: ['🏗️ 小小工程师', '小小工程师', '小工程师'] },
  { id: 'creative-builder', name: '创意建造师', emoji: '🏗️', desc: '自己选零件完成建造', aliases: ['🔧 创意建造师', '创意建造师'] },
  { id: 'artist', name: '小画家', emoji: '🎨', desc: '完成一幅道闸画', aliases: ['🎨 小画家', '小画家'] },
  { id: 'musician', name: '节奏小鼓手', emoji: '🥁', desc: '跟着节拍打出稳定节奏', aliases: ['节奏小鼓手', '小音乐家', '鼓点之王'] },
  { id: 'storyteller', name: '故事大王', emoji: '📚', desc: '听完故事并做出选择', aliases: ['故事大王'] },
  { id: 'world-traveler', name: '世界小使者', emoji: '🌍', desc: '认识不同地方的大门与规则', aliases: ['🌍 环球小旅行家', '环球小旅行家'] },
];

const aliasToId = new Map<string, string>();
for (const badge of BADGES) {
  aliasToId.set(badge.id, badge.id);
  aliasToId.set(badge.name, badge.id);
  for (const alias of badge.aliases) aliasToId.set(alias, badge.id);
}

export function normalizeBadgeId(raw: string): string {
  return aliasToId.get(raw) ?? raw;
}

export function hasBadge(earned: string[], badgeId: string): boolean {
  return earned.map(normalizeBadgeId).includes(badgeId);
}

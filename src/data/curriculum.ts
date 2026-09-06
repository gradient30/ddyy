import type { AgeBand } from './age';

export type Domain = 'health' | 'language' | 'math' | 'science' | 'art' | 'social';

export const DOMAIN_LABEL: Record<Domain, string> = {
  health: '健康安全',
  language: '语言',
  math: '数学',
  science: '科学',
  art: '艺术',
  social: '社会',
};

export interface KnowledgeCard {
  id: string;
  domain: Domain;
  name: string;
  desc: string;
}

export const KNOWLEDGE: KnowledgeCard[] = [
  { id: 'greet-friend', domain: 'social', name: '打招呼', desc: '看见朋友会问好，知道自己的名字' },
  { id: 'observe-find', domain: 'science', name: '仔细观察', desc: '能按名称找到藏起来的物品' },
  { id: 'count-5', domain: 'math', name: '点数到5', desc: '一个一个点，数和物对应' },
  { id: 'count-10', domain: 'math', name: '点数到10', desc: '不跳数、不多数' },
  { id: 'compare', domain: 'math', name: '比多少', desc: '能说出哪边多、哪边少、还是一样多' },
  { id: 'shapes', domain: 'math', name: '认识形状', desc: '圆、方、三角能指认' },
  { id: 'pattern', domain: 'math', name: '找规律', desc: '能接着红绿红绿往下排' },
  { id: 'add-subtract', domain: 'math', name: '来了与走了', desc: '理解又来了几辆，或开走了几辆' },
  { id: 'colors', domain: 'language', name: '颜色词', desc: '红黄蓝绿能听能说' },
  { id: 'opposites', domain: 'language', name: '相反词', desc: '大/小、上/下、开/关' },
  { id: 'safety-words', domain: 'language', name: '安全词', desc: '停、行、车、安全' },
  { id: 'stop-go', domain: 'health', name: '红灯停绿灯行', desc: '看见红灯停下，绿灯再走' },
  { id: 'crosswalk', domain: 'health', name: '过马路', desc: '走在斑马线上，慢慢走' },
  { id: 'park-safe', domain: 'health', name: '车停在车位', desc: '车要停在格子里才安全' },
  { id: 'lever', domain: 'science', name: '杠杆', desc: '杆子一边下、一边上' },
  { id: 'solar', domain: 'science', name: '太阳能', desc: '太阳可以给机器“吃饭”' },
  { id: 'sensor', domain: 'science', name: '传感器', desc: '眼睛一样的零件能“看见”车来了' },
  { id: 'assemble', domain: 'science', name: '按步骤做', desc: '先底座，再柱子，再杆子' },
  { id: 'express-color', domain: 'art', name: '选颜色画画', desc: '用颜色表达喜欢' },
  { id: 'express-beat', domain: 'art', name: '稳定节拍', desc: '跟着咚嗒咚嗒打' },
  { id: 'story-choice', domain: 'social', name: '做出选择', desc: '听故事并想想为什么' },
  { id: 'world-same-different', domain: 'social', name: '世界不一样', desc: '不同地方的大门长得不同，但都是为了安全' },
];

export interface Station {
  id: string;
  path: string;
  name: string;
  subtitle: string;
  domain: Domain;
  icon: string;
  tint: string;
  goal: Record<AgeBand, string>;
  knowledgeIds: string[];
}

/** 成长小路：按学前五大领域 + 数感编排，必须按序解锁 */
export const STATIONS: Station[] = [
  {
    id: 'welcome',
    path: '/welcome',
    name: '欢迎小屋',
    subtitle: '认识小闸闸',
    domain: 'social',
    icon: '🏠',
    tint: 'from-sky/30 to-card',
    goal: {
      sprout: '听小闸闸打招呼，点一下出发',
      explorer: '听中文问候，跟读你的名字',
      builder: '听完后能说出今天要去哪一站',
    },
    knowledgeIds: ['greet-friend'],
  },
  {
    id: 'observe',
    path: '/treasure',
    name: '观察花园',
    subtitle: '找一找，归一类',
    domain: 'science',
    icon: '🔎',
    tint: 'from-orange-warm/25 to-card',
    goal: {
      sprout: '找到藏起来的3样东西',
      explorer: '找到零件，并放到对的位置',
      builder: '完成寻找和组装两步',
    },
    knowledgeIds: ['observe-find'],
  },
  {
    id: 'math',
    path: '/math',
    name: '数感小岛',
    subtitle: '数、比、形状、规律',
    domain: 'math',
    icon: '🔢',
    tint: 'from-golden/30 to-card',
    goal: {
      sprout: '点数1到5，认识圆和方',
      explorer: '点数到10，比较多少，接着排规律',
      builder: '理解来了几辆、走了几辆',
    },
    knowledgeIds: ['count-5', 'compare', 'shapes', 'pattern'],
  },
  {
    id: 'language',
    path: '/language',
    name: '语言小屋',
    subtitle: '听一听，说一说',
    domain: 'language',
    icon: '📘',
    tint: 'from-secondary/30 to-card',
    goal: {
      sprout: '听音配对颜色和形状',
      explorer: '学会相反词和安全词',
      builder: '能听、能说，还能试着拼',
    },
    knowledgeIds: ['colors', 'opposites', 'safety-words'],
  },
  {
    id: 'safety',
    path: '/traffic',
    name: '安全街道',
    subtitle: '红灯停，绿灯行',
    domain: 'health',
    icon: '🚦',
    tint: 'from-coral/25 to-card',
    goal: {
      sprout: '红灯停，车停进格子',
      explorer: '会过斑马线，会数来往的车',
      builder: '能说出为什么要这样做',
    },
    knowledgeIds: ['stop-go', 'crosswalk', 'park-safe'],
  },
  {
    id: 'science',
    path: '/lab',
    name: '科学小屋',
    subtitle: '先猜，再试',
    domain: 'science',
    icon: '🔬',
    tint: 'from-purple-fun/25 to-card',
    goal: {
      sprout: '摸摸看，道闸有哪几部分',
      explorer: '先猜会发生什么，再动手',
      builder: '能用自己的话讲杠杆和太阳能',
    },
    knowledgeIds: ['lever', 'solar', 'sensor'],
  },
  {
    id: 'engineer',
    path: '/factory',
    name: '工程工坊',
    subtitle: '一步一步装起来',
    domain: 'science',
    icon: '🛠️',
    tint: 'from-orange-warm/30 to-card',
    goal: {
      sprout: '跟着提示点选零件',
      explorer: '按8步把道闸装好',
      builder: '自己选零件完成一座闸',
    },
    knowledgeIds: ['assemble'],
  },
  {
    id: 'express',
    path: '/express',
    name: '表达舞台',
    subtitle: '画、敲、讲故事',
    domain: 'art',
    icon: '🎭',
    tint: 'from-purple-fun/20 to-card',
    goal: {
      sprout: '选喜欢的颜色涂一涂',
      explorer: '跟着鼓点敲稳定节奏',
      builder: '听故事并做出选择',
    },
    knowledgeIds: ['express-color', 'express-beat', 'story-choice'],
  },
  {
    id: 'world',
    path: '/world-tour',
    name: '世界花园',
    subtitle: '大门各地不一样',
    domain: 'social',
    icon: '🌏',
    tint: 'from-grass/25 to-card',
    goal: {
      sprout: '认识5个地方的大门',
      explorer: '比较10个地方哪里不同',
      builder: '能说出“不同，但都是为了安全”',
    },
    knowledgeIds: ['world-same-different'],
  },
];

export function isStationUnlocked(
  stationId: string,
  completed: string[],
  unlockAll = false,
): boolean {
  if (unlockAll) return true;
  const index = STATIONS.findIndex(s => s.id === stationId);
  if (index <= 0) return true;
  return completed.includes(STATIONS[index - 1].id);
}

export function nextLockedStation(completed: string[]): Station | null {
  return STATIONS.find(s => !isStationUnlocked(s.id, completed)) ?? null;
}

export function recommendedStation(completed: string[]): Station {
  return STATIONS.find(s => isStationUnlocked(s.id, completed) && !completed.includes(s.id))
    ?? STATIONS[STATIONS.length - 1];
}

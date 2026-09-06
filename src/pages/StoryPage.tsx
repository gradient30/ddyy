import React, { useState, useCallback } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { playClick, playSuccess, playError, vibrate } from '@/lib/sound';
import { speak, delay } from '@/lib/speech';

// ===================== STORY DATA =====================

interface StoryNode {
  id: string;
  text: string;
  emoji: string;
  choices?: { label: string; next: string; emoji: string }[];
  ending?: string;
  badge?: string;
  thinkPrompt?: { question: string; options: string[] };
}

interface Story {
  id: number;
  title: string;
  emoji: string;
  desc: string;
  nodes: Record<string, StoryNode>;
}

const STORIES: Story[] = [
  {
    id: 1, title: '小兔选道闸', emoji: '🐰', desc: '帮小兔选对道闸回家',
    nodes: {
      start: { id: 'start', text: '小兔开车来到停车场，前面有两个道闸，一个亮着绿灯，一个亮着红灯。', emoji: '🐰🚗',
        thinkPrompt: { question: '你觉得小兔应该走哪个？为什么？', options: ['绿灯安全可以走', '红灯也能走'] },
        choices: [
          { label: '走绿灯道闸', next: 'green', emoji: '🟢' },
          { label: '走红灯道闸', next: 'red', emoji: '🔴' },
        ]},
      green: { id: 'green', text: '绿灯亮了，道闸缓缓升起，小兔安全通过了！小兔开心地说："绿灯行，真安全！"', emoji: '✅🎉',
        ending: '🌟 完美结局！小兔安全回家了！', badge: '绿灯小卫士' },
      red: { id: 'red', text: '红灯亮着，道闸紧紧关着。小兔等了一会儿...', emoji: '🛑',
        thinkPrompt: { question: '红灯关着门，小兔该怎么办？', options: ['耐心等待最安全', '冲过去更快'] },
        choices: [
          { label: '耐心等绿灯', next: 'wait', emoji: '⏰' },
          { label: '试试闯过去', next: 'crash', emoji: '💨' },
        ]},
      wait: { id: 'wait', text: '小兔耐心等待，绿灯亮了！道闸升起，小兔安全通过。"耐心等待是对的！"', emoji: '⏰✅',
        ending: '🌟 好结局！耐心的小兔最棒！' },
      crash: { id: 'crash', text: '哎呀！道闸没开，车被挡住了。小闸闸说："红灯要停下来哦！再试一次吧！"', emoji: '😅🚧',
        choices: [{ label: '回去等绿灯', next: 'wait', emoji: '🔙' }] },
    }
  },
  {
    id: 2, title: '小熊修道闸', emoji: '🐻', desc: '帮小熊修好坏掉的道闸',
    nodes: {
      start: { id: 'start', text: '小区的道闸坏了！车子们排着长队。小熊决定帮忙修理。先检查哪里？', emoji: '🐻🔧',
        thinkPrompt: { question: '道闸不动了，你觉得是哪里坏了？', options: ['可能是电机没电了', '可能是传感器坏了'] },
        choices: [
          { label: '检查电机', next: 'motor', emoji: '⚙️' },
          { label: '检查传感器', next: 'sensor', emoji: '👁️' },
        ]},
      motor: { id: 'motor', text: '小熊发现电机没电了！需要给它充电。用什么充电呢？', emoji: '⚙️❌',
        thinkPrompt: { question: '什么能源最环保？', options: ['太阳能最环保', '手摇也不错'] },
        choices: [
          { label: '太阳能板', next: 'solar', emoji: '☀️' },
          { label: '手摇发电', next: 'hand', emoji: '💪' },
        ]},
      sensor: { id: 'sensor', text: '传感器很正常，小红外线灯在一闪一闪。问题不在这里，去检查电机吧！', emoji: '👁️✅',
        choices: [{ label: '去检查电机', next: 'motor', emoji: '⚙️' }] },
      solar: { id: 'solar', text: '阳光照在太阳能板上，电慢慢充满了！道闸又能动了！小熊是最棒的小工程师！', emoji: '☀️⚡✅',
        ending: '🌟 完美结局！太阳能拯救了道闸！', badge: '小小工程师' },
      hand: { id: 'hand', text: '小熊使劲摇啊摇，发出了一点点电！道闸动了一下。但太慢了...要不试试太阳能？', emoji: '💪😅',
        choices: [{ label: '用太阳能', next: 'solar', emoji: '☀️' }] },
    }
  },
  {
    id: 3, title: '小猫的冒险', emoji: '🐱', desc: '小猫在停车场的奇妙旅程',
    nodes: {
      start: { id: 'start', text: '小猫溜进了停车场，看到好多有趣的东西！先去看看什么？', emoji: '🐱👀',
        choices: [
          { label: '看道闸升降', next: 'barrier', emoji: '🚧' },
          { label: '数停车场的车', next: 'count', emoji: '🚗' },
        ]},
      barrier: { id: 'barrier', text: '哇！道闸一会儿升一会儿降，像在跳舞！小猫看得入迷了。突然一辆车开过来...', emoji: '🚧💃',
        thinkPrompt: { question: '车来了，小猫在道闸旁边，怎么办？', options: ['赶紧到安全区', '继续看没关系'] },
        choices: [
          { label: '站在安全区', next: 'safe', emoji: '🛡️' },
          { label: '继续看', next: 'danger', emoji: '👀' },
        ]},
      count: { id: 'count', text: '小猫数了数：1、2、3...一共有5辆车！红色的、蓝色的、白色的，好多颜色！', emoji: '🔢🚗',
        choices: [{ label: '去看道闸', next: 'barrier', emoji: '🚧' }] },
      safe: { id: 'safe', text: '小猫跳到安全区，车安全通过了。保安叔叔说："小猫真聪明，知道站在安全的地方！"', emoji: '🛡️✅',
        ending: '🌟 完美结局！安全第一的小猫！', badge: '安全小卫士' },
      danger: { id: 'danger', text: '传感器发现了小猫！道闸立刻停了下来！保安叔叔把小猫抱到安全的地方。"以后要注意安全哦！"', emoji: '👁️🛑',
        choices: [{ label: '谢谢保安叔叔', next: 'safe', emoji: '🙏' }] },
    }
  },
  {
    id: 4, title: '彩虹道闸', emoji: '🌈', desc: '一起给道闸涂上美丽的颜色',
    nodes: {
      start: { id: 'start', text: '今天是道闸乐园的"美化日"！小闸闸想换个新颜色。选什么颜色呢？', emoji: '🎨🚧',
        choices: [
          { label: '天空蓝', next: 'blue', emoji: '💙' },
          { label: '彩虹色', next: 'rainbow', emoji: '🌈' },
        ]},
      blue: { id: 'blue', text: '小闸闸穿上天空蓝的新衣服，像蓝天一样好看！要不要加一些装饰？', emoji: '💙🚧',
        choices: [
          { label: '加星星贴纸', next: 'stars', emoji: '⭐' },
          { label: '就这样很好', next: 'done_blue', emoji: '👍' },
        ]},
      rainbow: { id: 'rainbow', text: '哇！七种颜色的道闸，太漂亮了！红橙黄绿蓝靛紫，像一道彩虹！所有人都来拍照！', emoji: '🌈✨',
        ending: '🌟 完美结局！最美丽的彩虹道闸！', badge: '彩虹画家' },
      stars: { id: 'stars', text: '蓝色道闸上贴满了金色星星，晚上还会一闪一闪！小朋友们都说："好像星空！"', emoji: '💙⭐✨',
        ending: '🌟 完美结局！星空道闸诞生了！' },
      done_blue: { id: 'done_blue', text: '简简单单的天空蓝，清清爽爽。小闸闸说："有时候简单也很美！"', emoji: '💙😊',
        ending: '🌟 好结局！简约之美！' },
    }
  },
  {
    id: 5, title: '道闸运动会', emoji: '🏅', desc: '道闸们比赛谁升得最快',
    nodes: {
      start: { id: 'start', text: '今天是道闸运动会！三个道闸比赛：直臂闸、折臂闸、围栏闸。你帮谁加油？', emoji: '🏁🚧',
        thinkPrompt: { question: '你觉得哪种道闸速度最快？', options: ['直臂闸又直又快', '折臂闸更灵活'] },
        choices: [
          { label: '直臂闸', next: 'straight', emoji: '📏' },
          { label: '折臂闸', next: 'folding', emoji: '📐' },
        ]},
      straight: { id: 'straight', text: '直臂闸"嗖"地一下就升起来了！速度最快！但是它太长了，差点碰到旁边的树...', emoji: '📏💨',
        choices: [
          { label: '小心调整', next: 'adjust', emoji: '🔧' },
          { label: '换一个试试', next: 'folding', emoji: '📐' },
        ]},
      folding: { id: 'folding', text: '折臂闸优雅地折叠升起，不占地方！虽然慢一点，但很安全。所有人鼓掌！', emoji: '📐👏',
        ending: '🌟 完美结局！折臂闸赢得了"最佳优雅奖"！', badge: '运动裁判' },
      adjust: { id: 'adjust', text: '调整好角度后，直臂闸完美升起！快又安全！裁判说："速度和安全都很重要！"', emoji: '📏✅',
        ending: '🌟 完美结局！直臂闸获得"最快速度奖"！' },
    }
  },
];

// ===================== THINKING PROMPT =====================

const ThinkingPrompt: React.FC<{
  prompt: { question: string; options: string[] };
  onDone: () => void;
}> = ({ prompt, onDone }) => {
  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (idx: number) => {
    playClick();
    vibrate(30);
    setPicked(idx);
    speak(`你选了"${prompt.options[idx]}"，好有想法！`);
    setTimeout(onDone, 1500);
  };

  return (
    <div className="bg-golden/15 rounded-2xl p-4 text-center animate-pop-in">
      <p className="text-sm font-bold text-foreground mb-1">🤔 想一想</p>
      <p className="text-base font-bold text-foreground mb-3">{prompt.question}</p>
      <div className="grid gap-2">
        {prompt.options.map((opt, i) => (
          <button key={i} onClick={() => handlePick(i)}
            disabled={picked !== null}
            className={`p-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              picked === i ? 'bg-accent/30 ring-2 ring-accent' : 'bg-card hover:bg-primary/10 border border-border'
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {picked !== null && <p className="text-xs text-muted-foreground mt-2 animate-pop-in">👍 好想法！继续看故事...</p>}
    </div>
  );
};

// ===================== STORY READER =====================

const StoryReader: React.FC<{ story: Story; onFinish: (badge?: string) => void }> = ({ story, onFinish }) => {
  const [nodeId, setNodeId] = useState('start');
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingDone, setThinkingDone] = useState(false);
  const node = story.nodes[nodeId];

  // Show thinking prompt on node change
  React.useEffect(() => {
    if (node?.thinkPrompt) {
      setShowThinking(true);
      setThinkingDone(false);
    } else {
      setShowThinking(false);
      setThinkingDone(true);
    }
  }, [nodeId, node?.thinkPrompt]);

  const handleChoice = async (next: string) => {
    playClick();
    vibrate(30);
    setNodeId(next);
    const nextNode = story.nodes[next];
    if (nextNode) {
      await speak(nextNode.text);
    }
  };

  if (!node) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-6xl animate-pop-in">{node.emoji}</div>
      <p className="text-base text-foreground text-center leading-relaxed max-w-xs font-bold">{node.text}</p>

      {/* Thinking prompt before choices */}
      {showThinking && node.thinkPrompt && !thinkingDone && (
        <ThinkingPrompt prompt={node.thinkPrompt} onDone={() => setThinkingDone(true)} />
      )}

      {/* Show choices only after thinking */}
      {thinkingDone && node.ending ? (
        <div className="text-center animate-pop-in">
          <p className="text-xl mb-3">{node.ending}</p>
          <button onClick={() => { playSuccess(); vibrate(100); onFinish(node.badge); }}
            className="touch-target rounded-2xl bg-accent/20 hover:bg-accent/30 font-bold text-lg px-6 py-3 active:scale-95 transition-all text-foreground">
            🎉 完成！
          </button>
        </div>
      ) : thinkingDone && node.choices ? (
        <div className="grid gap-2 w-full max-w-xs">
          {node.choices.map(choice => (
            <button key={choice.next} onClick={() => handleChoice(choice.next)}
              className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all active:scale-[0.97]">
              <span className="text-2xl">{choice.emoji}</span>
              <span className="font-bold text-foreground">{choice.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

// ===================== MAIN STORY PAGE =====================

const StoryPage: React.FC = () => {
  const { addStars, addBadge, addKnowledge, completeStation } = useGame();
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const handleFinish = useCallback((storyId: number, badge?: string) => {
    setCompleted(prev => { const n = new Set(prev); n.add(storyId); return n; });
    addStars(3);
    if (badge) addBadge('storyteller');
    addKnowledge('story-choice');
    if (completed.size + 1 === 5) {
      addBadge('storyteller');
      completeStation('express');
      speak('你会听故事，也会做选择');
    }
    setTimeout(() => setActiveStory(null), 1500);
  }, [addStars, addBadge, completed.size]);

  const handleStartStory = async (storyId: number) => {
    playClick();
    setActiveStory(storyId);
    const story = STORIES.find(s => s.id === storyId);
    if (story) {
      await speak(story.nodes.start.text);
    }
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-grass/15 via-background to-golden/10 pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {activeStory === null ? (
            <>
              <div className="text-center mb-6">
                <XiaoZhaZha mood="happy" size={80} />
                <h1 className="text-3xl font-black text-foreground mt-2">📖 故事王国</h1>
                <p className="text-muted-foreground">5个互动故事，你来决定结局！</p>
                <p className="text-sm text-muted-foreground/70">已完成 {completed.size}/5</p>
              </div>
              <div className="grid gap-3">
                {STORIES.map(story => (
                  <button key={story.id}
                    onClick={() => handleStartStory(story.id)}
                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all active:scale-[0.97] ${
                      completed.has(story.id) ? 'bg-accent/20 border-2 border-accent' : 'bg-card border-2 border-border hover:border-primary/30'
                    }`}>
                    <span className="text-4xl">{story.emoji}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-foreground">{story.title}</p>
                      <p className="text-sm text-muted-foreground">{story.desc}</p>
                    </div>
                    <span className="text-lg">{completed.has(story.id) ? '⭐' : '📖'}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { playClick(); setActiveStory(null); }}
                className="touch-target rounded-2xl bg-card hover:bg-muted px-4 py-2 font-bold text-foreground mb-4 active:scale-95 transition-all">
                ← 返回故事列表
              </button>
              <div className="bg-card rounded-3xl shadow-lg p-5">
                <h2 className="text-xl font-black text-center text-foreground mb-4">
                  {STORIES.find(s => s.id === activeStory)?.emoji} {STORIES.find(s => s.id === activeStory)?.title}
                </h2>
                <StoryReader
                  story={STORIES.find(s => s.id === activeStory)!}
                  onFinish={(badge) => handleFinish(activeStory, badge)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StoryPage;

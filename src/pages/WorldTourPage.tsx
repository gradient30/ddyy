import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick, playSuccess, playStarCollect, playError } from '@/lib/sound';
import { speak, delay } from '@/lib/speech';
import { vibrate } from '@/lib/sound';
import CountryBarrierSVG from '@/components/barriers/CountryBarrierSVG';

interface BarrierCountry {
  id: string;
  country: string;
  countryEn: string;
  flag: string;
  barrierName: string;
  barrierNameEn: string;
  desc: string;
  descEn: string;
  color: string;
  emoji: string;
  feature: string;
  x: number;
  y: number;
  quiz: { question: string; options: string[]; correct: number };
}

const countries: BarrierCountry[] = [
  { id: 'cn', country: '中国', countryEn: 'China', flag: '🇨🇳', barrierName: '直臂道闸', barrierNameEn: 'Straight Arm Barrier', desc: '小区门口最常见的道闸，杆子直直的，像一只手臂！', descEn: 'The most common barrier at Chinese communities!', color: 'from-coral to-golden', emoji: '🏘️', feature: '直臂杠杆', x: 75, y: 38, quiz: { question: '中国小区的道闸杆子是什么形状？', options: ['直直的', '弯弯的', '圆圆的'], correct: 0 } },
  { id: 'us', country: '美国', countryEn: 'USA', flag: '🇺🇸', barrierName: '广告屏道闸', barrierNameEn: 'LED Screen Barrier', desc: '商场停车场的道闸上有广告屏幕，好酷！', descEn: 'Mall barriers with LED advertising screens!', color: 'from-sky to-purple-fun', emoji: '🏬', feature: 'LED广告', x: 20, y: 35, quiz: { question: '美国商场道闸上有什么特别的？', options: ['太阳能板', '广告屏幕', '小喇叭'], correct: 1 } },
  { id: 'jp', country: '日本', countryEn: 'Japan', flag: '🇯🇵', barrierName: '折臂道闸', barrierNameEn: 'Folding Arm Barrier', desc: '地下停车场用折叠杆，空间小也能用！', descEn: 'Folding arms for underground parking!', color: 'from-coral to-sky', emoji: '🅿️', feature: '折叠设计', x: 82, y: 32, quiz: { question: '日本的道闸为什么用折叠设计？', options: ['更好看', '节省空间', '更便宜'], correct: 1 } },
  { id: 'au', country: '澳大利亚', countryEn: 'Australia', flag: '🇦🇺', barrierName: '太阳能道闸', barrierNameEn: 'Solar Barrier', desc: '用太阳能发电的道闸，环保又聪明！', descEn: 'Solar-powered barriers, eco-friendly!', color: 'from-golden to-orange-warm', emoji: '☀️', feature: '太阳能', x: 85, y: 68, quiz: { question: '澳大利亚的道闸用什么能源？', options: ['风力', '太阳能', '汽油'], correct: 1 } },
  { id: 'de', country: '德国', countryEn: 'Germany', flag: '🇩🇪', barrierName: '围栏道闸', barrierNameEn: 'Fence Barrier', desc: '高速公路收费站用的超长围栏道闸！', descEn: 'Extra-long fence barriers at highway tolls!', color: 'from-grass to-sky', emoji: '🛣️', feature: '超长围栏', x: 48, y: 28, quiz: { question: '德国的围栏道闸用在哪里？', options: ['小区门口', '高速收费站', '学校'], correct: 1 } },
  { id: 'ke', country: '肯尼亚', countryEn: 'Kenya', flag: '🇰🇪', barrierName: '手动道闸', barrierNameEn: 'Manual Barrier', desc: '野生动物保护区用手动杆子，保护动物！', descEn: 'Manual barriers protect wildlife reserves!', color: 'from-grass to-golden', emoji: '🦁', feature: '手动操作', x: 52, y: 55, quiz: { question: '肯尼亚的手动道闸保护什么？', options: ['停车场', '野生动物', '商场'], correct: 1 } },
  { id: 'ae', country: '阿联酋', countryEn: 'UAE', flag: '🇦🇪', barrierName: '智能翻板闸', barrierNameEn: 'Smart Flip Barrier', desc: '机场用的智能翻板，刷卡就通过！', descEn: 'Smart flip gates at airports!', color: 'from-golden to-coral', emoji: '✈️', feature: '人脸识别', x: 55, y: 40, quiz: { question: '阿联酋机场的闸机用什么技术？', options: ['钥匙', '人脸识别', '密码'], correct: 1 } },
  { id: 'br', country: '巴西', countryEn: 'Brazil', flag: '🇧🇷', barrierName: '彩色道闸', barrierNameEn: 'Colorful Barrier', desc: '巴西人喜欢给道闸涂上漂亮颜色！', descEn: 'Brazilians love colorful barriers!', color: 'from-grass to-golden', emoji: '🎨', feature: '彩色涂装', x: 28, y: 60, quiz: { question: '巴西的道闸有什么特别？', options: ['特别大', '涂上漂亮颜色', '会唱歌'], correct: 1 } },
  { id: 'in', country: '印度', countryEn: 'India', flag: '🇮🇳', barrierName: '铁路道闸', barrierNameEn: 'Railway Barrier', desc: '火车来了道闸会放下来，保护行人安全！', descEn: 'Railway barriers protect pedestrians!', color: 'from-orange-warm to-coral', emoji: '🚂', feature: '铁路安全', x: 68, y: 42, quiz: { question: '印度铁路道闸什么时候放下？', options: ['车来了', '天黑了', '下雨了'], correct: 0 } },
  { id: 'fr', country: '法国', countryEn: 'France', flag: '🇫🇷', barrierName: '升降柱', barrierNameEn: 'Rising Bollard', desc: '从地面升起的柱子，保护古城步行街！', descEn: 'Rising bollards protect old town streets!', color: 'from-sky to-coral', emoji: '🏰', feature: '地面升降', x: 45, y: 30, quiz: { question: '法国的升降柱从哪里升起来？', options: ['天上', '地面', '墙壁'], correct: 1 } },
  { id: 'kr', country: '韩国', countryEn: 'South Korea', flag: '🇰🇷', barrierName: '车牌识别闸', barrierNameEn: 'License Plate Barrier', desc: '摄像头看一眼车牌就自动开门！', descEn: 'Cameras read plates to open automatically!', color: 'from-sky to-grass', emoji: '📷', feature: '车牌识别', x: 80, y: 34, quiz: { question: '韩国的道闸怎么识别车辆？', options: ['看车牌', '看颜色', '听喇叭'], correct: 0 } },
  { id: 'eg', country: '埃及', countryEn: 'Egypt', flag: '🇪🇬', barrierName: '旅游区道闸', barrierNameEn: 'Tourist Area Barrier', desc: '金字塔景区门口也有道闸哦！', descEn: 'Even the Pyramids have barriers!', color: 'from-golden to-orange-warm', emoji: '🏛️', feature: '景区管理', x: 50, y: 42, quiz: { question: '埃及哪个著名景点有道闸？', options: ['金字塔', '长城', '埃菲尔铁塔'], correct: 0 } },
  { id: 'ca', country: '加拿大', countryEn: 'Canada', flag: '🇨🇦', barrierName: '加热道闸', barrierNameEn: 'Heated Barrier', desc: '冬天太冷，道闸会自己加热不结冰！', descEn: 'Self-heating barriers for cold winters!', color: 'from-sky to-purple-fun', emoji: '❄️', feature: '防冻加热', x: 18, y: 25, quiz: { question: '加拿大的道闸为什么要加热？', options: ['更好看', '防止结冰', '跑得更快'], correct: 1 } },
  { id: 'sg', country: '新加坡', countryEn: 'Singapore', flag: '🇸🇬', barrierName: 'ERP电子闸', barrierNameEn: 'ERP Electronic Gate', desc: '不用停车，开过去自动扣费！', descEn: 'Drive through, auto-pay electronically!', color: 'from-grass to-sky', emoji: '💳', feature: '电子收费', x: 76, y: 52, quiz: { question: '新加坡的ERP闸怎么收费？', options: ['投硬币', '自动扣费', '免费'], correct: 1 } },
  { id: 'mx', country: '墨西哥', countryEn: 'Mexico', flag: '🇲🇽', barrierName: '社区共享闸', barrierNameEn: 'Community Gate', desc: '邻居们一起用的社区大门道闸！', descEn: 'Community shared neighborhood gates!', color: 'from-coral to-golden', emoji: '🏡', feature: '社区共享', x: 15, y: 42, quiz: { question: '墨西哥的社区闸是谁用的？', options: ['只有一家人', '邻居们一起用', '只有车用'], correct: 1 } },
];

// BarrierSVG removed - now using CountryBarrierSVG component

const GlobeView: React.FC<{ countries: BarrierCountry[]; visited: Set<string>; onSelect: (c: BarrierCountry) => void }> = ({ countries, visited, onSelect }) => (
  <div className="relative w-full max-w-lg mx-auto bg-sky/10 rounded-[2rem] border-4 border-sky/30 overflow-hidden" style={{ height: '320px' }}>
    <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[200px]">🌍</div>
    {countries.map(c => (
      <button key={c.id} onClick={() => { playClick(); onSelect(c); }}
        className={`absolute flex flex-col items-center gap-0.5 p-2 min-w-[64px] rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${visited.has(c.id) ? 'bg-golden/30 ring-2 ring-golden' : 'bg-card/90 hover:bg-card'} shadow-md`}
        style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)' }}
        aria-label={c.country}>
        <span className="text-3xl">{c.flag}</span>
        <span className="text-xs font-extrabold text-foreground whitespace-nowrap">{c.country}</span>
      </button>
    ))}
  </div>
);

// ===================== QUIZ COMPONENT =====================

const CountryQuiz: React.FC<{
  quiz: { question: string; options: string[]; correct: number };
  onPass: () => void;
}> = ({ quiz, onPass }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const handlePick = (idx: number) => {
    playClick();
    setPicked(idx);
    if (idx === quiz.correct) {
      setResult('correct');
      playSuccess();
      vibrate(80);
      speak('答对了！真聪明！');
      setTimeout(onPass, 1200);
    } else {
      setResult('wrong');
      playError();
      speak('再想想哦！');
      setTimeout(() => { setPicked(null); setResult(null); }, 1200);
    }
  };

  return (
    <div className="bg-golden/10 rounded-2xl p-4 animate-pop-in">
      <p className="text-sm font-bold text-foreground mb-1">🧠 小测验</p>
      <p className="text-base font-bold text-foreground mb-3">{quiz.question}</p>
      <div className="grid gap-2">
        {quiz.options.map((opt, i) => (
          <button key={i} onClick={() => handlePick(i)}
            disabled={result === 'correct'}
            className={`p-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              picked === i && result === 'correct' ? 'bg-accent/30 ring-2 ring-accent' :
              picked === i && result === 'wrong' ? 'bg-destructive/20 ring-2 ring-destructive' :
              'bg-card hover:bg-primary/10 border border-border'
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {result === 'correct' && <p className="text-sm text-accent mt-2 animate-pop-in">🎉 太棒了！可以收集了！</p>}
    </div>
  );
};

// ===================== COUNTRY CARD =====================

const CountryCard: React.FC<{ country: BarrierCountry; onClose: () => void; onVisited: () => void }> = ({ country, onClose, onVisited }) => {
  const [isLifted, setIsLifted] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const handleListen = async () => {
    playClick();
    await speak(country.desc, 'zh-CN', 0.85);
    await delay(400);
    setShowEn(true);
    await speak(country.descEn, 'en-US', 0.8);
  };

  const handleDemo = () => {
    playClick();
    setIsLifted(true);
    vibrate(100);
    setTimeout(() => { setIsLifted(false); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-6 animate-pop-in relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 touch-target text-2xl rounded-full bg-muted hover:bg-muted/80 w-10 h-10 flex items-center justify-center">✕</button>

        <div className="text-center mb-4">
          <span className="text-5xl">{country.flag}</span>
          <h2 className="text-2xl font-black text-foreground mt-1">{country.country}</h2>
          <p className="text-sm text-muted-foreground">{country.countryEn}</p>
        </div>

        <div className={`bg-gradient-to-br ${country.color} rounded-2xl p-4 mb-4`}>
          <CountryBarrierSVG countryId={country.id} isLifted={isLifted} />
          <div className="text-center mt-2">
            <span className="text-3xl">{country.emoji}</span>
            <h3 className="text-xl font-bold text-primary-foreground">{country.barrierName}</h3>
            <p className="text-sm text-primary-foreground/80">{country.barrierNameEn}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-card/20 text-xs font-bold text-primary-foreground">✨ {country.feature}</span>
          </div>
        </div>

        <p className="text-lg font-bold text-foreground mb-1">{country.desc}</p>
        {showEn && <p className="text-base text-muted-foreground italic mb-3">{country.descEn}</p>}

        {/* Quiz before collecting */}
        {!quizPassed && (
          <div className="mb-3">
            <CountryQuiz quiz={country.quiz} onPass={() => setQuizPassed(true)} />
          </div>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={handleListen} className="touch-target rounded-2xl bg-sky/20 hover:bg-sky/30 px-5 py-3 text-lg font-bold transition-all active:scale-95">
            🔊 听介绍
          </button>
          <button onClick={handleDemo} className="touch-target rounded-2xl bg-golden/20 hover:bg-golden/30 px-5 py-3 text-lg font-bold transition-all active:scale-95">
            🚧 看升降
          </button>
          <button onClick={() => { playSuccess(); vibrate(80); onVisited(); onClose(); }}
            disabled={!quizPassed}
            className={`touch-target rounded-2xl px-5 py-3 text-lg font-bold transition-all active:scale-95 ${
              quizPassed ? 'bg-grass/20 hover:bg-grass/30' : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}>
            {quizPassed ? '⭐ 收集！' : '🔒 答题后收集'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN PAGE =====================

const SPROUT_IDS = ['cn', 'jp', 'au', 'in', 'fr'];
const EXPLORER_IDS = [...SPROUT_IDS, 'us', 'de', 'ke', 'br', 'kr'];

const WorldTourPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge, addKnowledge, completeStation, currentProfile } = useGame();
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<BarrierCountry | null>(null);
  const visible = currentProfile?.ageBand === 'sprout'
    ? countries.filter(c => SPROUT_IDS.includes(c.id))
    : currentProfile?.ageBand === 'builder'
      ? countries
      : countries.filter(c => EXPLORER_IDS.includes(c.id));
  const goal = visible.length;

  const handleVisited = (id: string) => {
    const newVisited = new Set(visited);
    if (!newVisited.has(id)) {
      newVisited.add(id);
      setVisited(newVisited);
      addStars(2);
      playStarCollect();
      vibrate(50);
      if (newVisited.size >= goal) {
        addBadge('world-traveler');
        addKnowledge('world-same-different');
        completeStation('world');
        playSuccess();
      }
    }
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-grass/15 via-background to-sky/10 pt-20 pb-8 px-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">世界花园</h1>
          <p className="text-sm text-muted-foreground mt-1">
            大门各地不一样，但都是为了安全。已认识 {visited.size}/{goal} 个地方
          </p>
          <div className="max-w-xs mx-auto mt-2 h-4 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky to-grass transition-all duration-500"
              style={{ width: `${(visited.size / goal) * 100}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <XiaoZhaZha mood={visited.size >= goal ? 'excited' : 'happy'} size={50} />
          <div className="bg-card rounded-2xl px-4 py-2 shadow-sm max-w-xs">
            <p className="text-sm font-bold text-foreground">
              {visited.size === 0 && '点一面旗，看看那里的大门为什么这样长。'}
              {visited.size > 0 && visited.size < goal && `很好！还差 ${goal - visited.size} 个地方。`}
              {visited.size >= goal && '不同的大门，同一句话：为了安全。'}
            </p>
          </div>
        </div>

        <GlobeView countries={visible} visited={visited} onSelect={setSelectedCountry} />

        {visited.size > 0 && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">🏆 已收集</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {visible.filter(c => visited.has(c.id)).map(c => (
                <span key={c.id} className="text-3xl animate-pop-in" title={c.country}>{c.flag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button onClick={() => { playClick(); navigate('/'); }} className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-6 py-3 text-lg font-bold transition-all active:scale-95">
            🏠 回到地图
          </button>
        </div>
      </div>

      {selectedCountry && (
        <CountryCard
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onVisited={() => handleVisited(selectedCountry.id)}
        />
      )}
    </>
  );
};

export default WorldTourPage;

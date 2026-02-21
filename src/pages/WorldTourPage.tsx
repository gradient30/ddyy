import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick, playSuccess, playStarCollect } from '@/lib/sound';
import { speak } from '@/lib/speech';
import { vibrate } from '@/lib/sound';

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
}

const countries: BarrierCountry[] = [
  { id: 'cn', country: '中国', countryEn: 'China', flag: '🇨🇳', barrierName: '直臂道闸', barrierNameEn: 'Straight Arm Barrier', desc: '小区门口最常见的道闸，杆子直直的，像一只手臂！', descEn: 'The most common barrier at Chinese communities!', color: 'from-coral to-golden', emoji: '🏘️', feature: '直臂杠杆', x: 75, y: 38 },
  { id: 'us', country: '美国', countryEn: 'USA', flag: '🇺🇸', barrierName: '广告屏道闸', barrierNameEn: 'LED Screen Barrier', desc: '商场停车场的道闸上有广告屏幕，好酷！', descEn: 'Mall barriers with LED advertising screens!', color: 'from-sky to-purple-fun', emoji: '🏬', feature: 'LED广告', x: 20, y: 35 },
  { id: 'jp', country: '日本', countryEn: 'Japan', flag: '🇯🇵', barrierName: '折臂道闸', barrierNameEn: 'Folding Arm Barrier', desc: '地下停车场用折叠杆，空间小也能用！', descEn: 'Folding arms for underground parking!', color: 'from-coral to-sky', emoji: '🅿️', feature: '折叠设计', x: 82, y: 32 },
  { id: 'au', country: '澳大利亚', countryEn: 'Australia', flag: '🇦🇺', barrierName: '太阳能道闸', barrierNameEn: 'Solar Barrier', desc: '用太阳能发电的道闸，环保又聪明！', descEn: 'Solar-powered barriers, eco-friendly!', color: 'from-golden to-orange-warm', emoji: '☀️', feature: '太阳能', x: 85, y: 68 },
  { id: 'de', country: '德国', countryEn: 'Germany', flag: '🇩🇪', barrierName: '围栏道闸', barrierNameEn: 'Fence Barrier', desc: '高速公路收费站用的超长围栏道闸！', descEn: 'Extra-long fence barriers at highway tolls!', color: 'from-grass to-sky', emoji: '🛣️', feature: '超长围栏', x: 48, y: 28 },
  { id: 'ke', country: '肯尼亚', countryEn: 'Kenya', flag: '🇰🇪', barrierName: '手动道闸', barrierNameEn: 'Manual Barrier', desc: '野生动物保护区用手动杆子，保护动物！', descEn: 'Manual barriers protect wildlife reserves!', color: 'from-grass to-golden', emoji: '🦁', feature: '手动操作', x: 52, y: 55 },
  { id: 'ae', country: '阿联酋', countryEn: 'UAE', flag: '🇦🇪', barrierName: '智能翻板闸', barrierNameEn: 'Smart Flip Barrier', desc: '机场用的智能翻板，刷卡就通过！', descEn: 'Smart flip gates at airports!', color: 'from-golden to-coral', emoji: '✈️', feature: '人脸识别', x: 55, y: 40 },
  { id: 'br', country: '巴西', countryEn: 'Brazil', flag: '🇧🇷', barrierName: '彩色道闸', barrierNameEn: 'Colorful Barrier', desc: '巴西人喜欢给道闸涂上漂亮颜色！', descEn: 'Brazilians love colorful barriers!', color: 'from-grass to-golden', emoji: '🎨', feature: '彩色涂装', x: 28, y: 60 },
  { id: 'in', country: '印度', countryEn: 'India', flag: '🇮🇳', barrierName: '铁路道闸', barrierNameEn: 'Railway Barrier', desc: '火车来了道闸会放下来，保护行人安全！', descEn: 'Railway barriers protect pedestrians!', color: 'from-orange-warm to-coral', emoji: '🚂', feature: '铁路安全', x: 68, y: 42 },
  { id: 'fr', country: '法国', countryEn: 'France', flag: '🇫🇷', barrierName: '升降柱', barrierNameEn: 'Rising Bollard', desc: '从地面升起的柱子，保护古城步行街！', descEn: 'Rising bollards protect old town streets!', color: 'from-sky to-coral', emoji: '🏰', feature: '地面升降', x: 45, y: 30 },
  { id: 'kr', country: '韩国', countryEn: 'South Korea', flag: '🇰🇷', barrierName: '车牌识别闸', barrierNameEn: 'License Plate Barrier', desc: '摄像头看一眼车牌就自动开门！', descEn: 'Cameras read plates to open automatically!', color: 'from-sky to-grass', emoji: '📷', feature: '车牌识别', x: 80, y: 34 },
  { id: 'eg', country: '埃及', countryEn: 'Egypt', flag: '🇪🇬', barrierName: '旅游区道闸', barrierNameEn: 'Tourist Area Barrier', desc: '金字塔景区门口也有道闸哦！', descEn: 'Even the Pyramids have barriers!', color: 'from-golden to-orange-warm', emoji: '🏛️', feature: '景区管理', x: 50, y: 42 },
  { id: 'ca', country: '加拿大', countryEn: 'Canada', flag: '🇨🇦', barrierName: '加热道闸', barrierNameEn: 'Heated Barrier', desc: '冬天太冷，道闸会自己加热不结冰！', descEn: 'Self-heating barriers for cold winters!', color: 'from-sky to-purple-fun', emoji: '❄️', feature: '防冻加热', x: 18, y: 25 },
  { id: 'sg', country: '新加坡', countryEn: 'Singapore', flag: '🇸🇬', barrierName: 'ERP电子闸', barrierNameEn: 'ERP Electronic Gate', desc: '不用停车，开过去自动扣费！', descEn: 'Drive through, auto-pay electronically!', color: 'from-grass to-sky', emoji: '💳', feature: '电子收费', x: 76, y: 52 },
  { id: 'mx', country: '墨西哥', countryEn: 'Mexico', flag: '🇲🇽', barrierName: '社区共享闸', barrierNameEn: 'Community Gate', desc: '邻居们一起用的社区大门道闸！', descEn: 'Community shared neighborhood gates!', color: 'from-coral to-golden', emoji: '🏡', feature: '社区共享', x: 15, y: 42 },
];

const BarrierSVG: React.FC<{ isLifted: boolean; color: string }> = ({ isLifted, color }) => (
  <svg viewBox="0 0 120 100" className="w-32 h-24 mx-auto">
    {/* 底座 */}
    <rect x="20" y="60" width="20" height="35" rx="3" fill="hsl(220,10%,40%)" />
    <rect x="22" y="62" width="16" height="8" rx="2" fill="hsl(195,100%,50%)" opacity="0.6" />
    {/* 杆子 */}
    <g style={{ transformOrigin: '30px 62px', transition: 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)', transform: isLifted ? 'rotate(-85deg)' : 'rotate(0deg)' }}>
      <rect x="30" y="58" width="80" height="8" rx="4" fill={color} />
      <rect x="100" y="56" width="12" height="12" rx="6" fill="hsl(54,100%,50%)" />
      {/* 反光条 */}
      {[45, 60, 75, 90].map(x => (
        <rect key={x} x={x} y="58" width="4" height="8" rx="1" fill="hsl(0,0%,100%)" opacity="0.5" />
      ))}
    </g>
    {/* 地面 */}
    <rect x="0" y="92" width="120" height="8" rx="2" fill="hsl(142,30%,70%)" />
  </svg>
);

const GlobeView: React.FC<{ countries: BarrierCountry[]; visited: Set<string>; onSelect: (c: BarrierCountry) => void }> = ({ countries, visited, onSelect }) => (
  <div className="relative w-full max-w-lg mx-auto bg-sky/10 rounded-[2rem] border-4 border-sky/30 overflow-hidden" style={{ height: '320px' }}>
    {/* 简化地球背景 */}
    <div className="absolute inset-0 flex items-center justify-center opacity-10 text-[200px]">🌍</div>
    {countries.map(c => (
      <button
        key={c.id}
        onClick={() => { playClick(); onSelect(c); }}
        className={`absolute flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all duration-300 hover:scale-125 active:scale-95 ${visited.has(c.id) ? 'bg-golden/30 ring-2 ring-golden' : 'bg-card/80 hover:bg-card'} shadow-md`}
        style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)' }}
        aria-label={c.country}
      >
        <span className="text-2xl">{c.flag}</span>
        <span className="text-[10px] font-bold text-foreground whitespace-nowrap">{c.country}</span>
      </button>
    ))}
  </div>
);

const CountryCard: React.FC<{ country: BarrierCountry; onClose: () => void; onVisited: () => void }> = ({ country, onClose, onVisited }) => {
  const [isLifted, setIsLifted] = useState(false);
  const [showEn, setShowEn] = useState(false);

  const handleListen = () => {
    playClick();
    speak(country.desc, 'zh-CN', 0.85).then(() => {
      setShowEn(true);
      speak(country.descEn, 'en-US', 0.8);
    });
  };

  const handleDemo = () => {
    playClick();
    setIsLifted(true);
    vibrate(100);
    setTimeout(() => { setIsLifted(false); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-6 animate-pop-in relative" onClick={e => e.stopPropagation()}>
        {/* 关闭 */}
        <button onClick={onClose} className="absolute top-3 right-3 touch-target text-2xl rounded-full bg-muted hover:bg-muted/80 w-10 h-10 flex items-center justify-center">✕</button>

        {/* 国旗+国家 */}
        <div className="text-center mb-4">
          <span className="text-5xl">{country.flag}</span>
          <h2 className="text-2xl font-black text-foreground mt-1">{country.country}</h2>
          <p className="text-sm text-muted-foreground">{country.countryEn}</p>
        </div>

        {/* 道闸动画 */}
        <div className={`bg-gradient-to-br ${country.color} rounded-2xl p-4 mb-4`}>
          <BarrierSVG isLifted={isLifted} color="hsl(0,72%,70%)" />
          <div className="text-center mt-2">
            <span className="text-3xl">{country.emoji}</span>
            <h3 className="text-xl font-bold text-primary-foreground">{country.barrierName}</h3>
            <p className="text-sm text-primary-foreground/80">{country.barrierNameEn}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-card/20 text-xs font-bold text-primary-foreground">✨ {country.feature}</span>
          </div>
        </div>

        {/* 介绍 */}
        <p className="text-lg font-bold text-foreground mb-1">{country.desc}</p>
        {showEn && <p className="text-base text-muted-foreground italic mb-3">{country.descEn}</p>}

        {/* 按钮 */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={handleListen} className="touch-target rounded-2xl bg-sky/20 hover:bg-sky/30 px-5 py-3 text-lg font-bold transition-all active:scale-95">
            🔊 听介绍
          </button>
          <button onClick={handleDemo} className="touch-target rounded-2xl bg-golden/20 hover:bg-golden/30 px-5 py-3 text-lg font-bold transition-all active:scale-95">
            🚧 看升降
          </button>
          <button onClick={() => { playSuccess(); vibrate(80); onVisited(); onClose(); }} className="touch-target rounded-2xl bg-grass/20 hover:bg-grass/30 px-5 py-3 text-lg font-bold transition-all active:scale-95">
            ⭐ 收集！
          </button>
        </div>
      </div>
    </div>
  );
};

const WorldTourPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge } = useGame();
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<BarrierCountry | null>(null);

  const handleVisited = (id: string) => {
    const newVisited = new Set(visited);
    if (!newVisited.has(id)) {
      newVisited.add(id);
      setVisited(newVisited);
      addStars(2);
      playStarCollect();
      vibrate(50);
      // 集齐15国
      if (newVisited.size >= 15) {
        addBadge('🌍 环球小旅行家');
        playSuccess();
      }
    }
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-grass/15 via-background to-sky/10 pt-20 pb-8 px-4">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">🌍 世界巡游岛</h1>
          <p className="text-sm text-muted-foreground mt-1">
            点击国旗探索全球道闸！已探索 {visited.size}/15 个国家
          </p>
          {/* 进度条 */}
          <div className="max-w-xs mx-auto mt-2 h-4 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky to-grass transition-all duration-500"
              style={{ width: `${(visited.size / 15) * 100}%` }}
            />
          </div>
        </div>

        {/* 小闸闸导游 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <XiaoZhaZha mood={visited.size >= 15 ? 'excited' : 'happy'} size={50} />
          <div className="bg-card rounded-2xl px-4 py-2 shadow-sm max-w-xs">
            <p className="text-sm font-bold text-foreground">
              {visited.size === 0 && '点击地图上的国旗，看看那里的道闸长什么样！'}
              {visited.size > 0 && visited.size < 15 && `太棒了！还有${15 - visited.size}个国家等你探索！`}
              {visited.size >= 15 && '🎉 你已经集齐15国！获得"环球小旅行家"徽章！'}
            </p>
          </div>
        </div>

        {/* 地球仪 / 地图 */}
        <GlobeView countries={countries} visited={visited} onSelect={setSelectedCountry} />

        {/* 已收集的国旗 */}
        {visited.size > 0 && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">🏆 已收集</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {countries.filter(c => visited.has(c.id)).map(c => (
                <span key={c.id} className="text-3xl animate-pop-in" title={c.country}>{c.flag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 返回 */}
        <div className="flex justify-center mt-6">
          <button onClick={() => { playClick(); navigate('/'); }} className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-6 py-3 text-lg font-bold transition-all active:scale-95">
            🏠 回到地图
          </button>
        </div>
      </div>

      {/* 国家详情弹窗 */}
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

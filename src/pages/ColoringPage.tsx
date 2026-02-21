import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick, playSuccess, playStarCollect, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

const templates = [
  { id: 'straight', name: '直臂道闸', emoji: '➖' },
  { id: 'folding', name: '折臂道闸', emoji: '📐' },
  { id: 'fence', name: '围栏道闸', emoji: '🔲' },
  { id: 'solar', name: '太阳能道闸', emoji: '☀️' },
  { id: 'railway', name: '铁路道闸', emoji: '🚂' },
  { id: 'bollard', name: '升降柱', emoji: '🔵' },
  { id: 'cute', name: '可爱道闸', emoji: '🐰' },
  { id: 'robot', name: '机器人道闸', emoji: '🤖' },
  { id: 'tree', name: '大树道闸', emoji: '🌳' },
  { id: 'rocket', name: '火箭道闸', emoji: '🚀' },
];

const colors = [
  { name: '红', hex: '#FF6B6B' },
  { name: '蓝', hex: '#00BFFF' },
  { name: '绿', hex: '#4ADE80' },
  { name: '黄', hex: '#FFEA00' },
  { name: '橙', hex: '#FF9F43' },
  { name: '紫', hex: '#A855F7' },
  { name: '粉', hex: '#FF69B4' },
  { name: '白', hex: '#FFFFFF' },
  { name: '棕', hex: '#8B4513' },
  { name: '灰', hex: '#9CA3AF' },
];

const stickers = ['⭐', '❤️', '🌟', '🚧', '😊', '🎈', '🦁', '🐰', '🌈', '✨', '🎪', '🏆'];

const brushSizes = [4, 8, 14, 22];

function drawBarrierTemplate(ctx: CanvasRenderingContext2D, templateId: string, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  // Light background
  ctx.fillStyle = '#F0F9FF';
  ctx.fillRect(0, 0, w, h);

  // Ground
  ctx.fillStyle = '#D1FAE5';
  ctx.fillRect(0, h - 40, w, 40);

  // Sky
  ctx.fillStyle = '#BAE6FD';
  ctx.fillRect(0, 0, w, 60);
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath(); ctx.arc(w - 50, 35, 20, 0, Math.PI * 2); ctx.fill();

  const cx = w / 2;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;

  // Base
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(cx - 25, h - 80, 50, 40);
  ctx.strokeRect(cx - 25, h - 80, 50, 40);

  // Pillar
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(cx - 12, h - 160, 24, 80);
  ctx.strokeRect(cx - 12, h - 160, 24, 80);

  // Arm (outline only for coloring)
  ctx.fillStyle = '#FFFFFF';
  const armY = h - 155;

  if (templateId === 'folding') {
    ctx.beginPath();
    ctx.moveTo(cx, armY); ctx.lineTo(cx + 60, armY); ctx.lineTo(cx + 60, armY - 50); ctx.lineTo(cx + 120, armY - 50);
    ctx.lineWidth = 12; ctx.strokeStyle = '#E2E8F0'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = '#1E293B'; ctx.stroke();
  } else if (templateId === 'fence') {
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx + 10 + i * 30, armY - 5, 8, 25);
      ctx.strokeRect(cx + 10 + i * 30, armY - 5, 8, 25);
    }
    ctx.fillRect(cx, armY, 130, 8);
    ctx.strokeRect(cx, armY, 130, 8);
    ctx.fillRect(cx, armY + 12, 130, 8);
    ctx.strokeRect(cx, armY + 12, 130, 8);
  } else {
    // Default straight arm
    ctx.fillRect(cx, armY, 130, 14);
    ctx.strokeRect(cx, armY, 130, 14);
    // Stripes (outlines)
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(cx + 20 + i * 28, armY, 10, 14);
    }
  }

  // Circle at end
  ctx.beginPath(); ctx.arc(cx + 135, armY + 7, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#FEF3C7'; ctx.fill(); ctx.stroke();

  // Motor
  ctx.beginPath(); ctx.arc(cx, h - 155, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#E0F2FE'; ctx.fill(); ctx.stroke();

  // Label
  ctx.fillStyle = '#64748B';
  ctx.font = '14px Nunito, sans-serif';
  ctx.textAlign = 'center';
  const t = templates.find(t => t.id === templateId);
  ctx.fillText(t ? `${t.emoji} ${t.name}` : '道闸', cx, h - 10);
}

const ColoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'fill' | 'sticker' | 'eraser'>('brush');
  const [selectedSticker, setSelectedSticker] = useState('⭐');
  const [saved, setSaved] = useState(false);

  const initCanvas = useCallback((templateId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 400;
    canvas.height = 320;
    drawBarrierTemplate(ctx, templateId, 400, 320);
  }, []);

  useEffect(() => {
    if (selectedTemplate) initCanvas(selectedTemplate);
  }, [selectedTemplate, initCanvas]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (tool === 'sticker') {
      const { x, y } = getPos(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.font = `${brushSize * 3}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(selectedSticker, x, y + brushSize);
        playClick();
      }
      return;
    }
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = tool === 'eraser' ? '#F0F9FF' : currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDraw = () => setIsDrawing(false);

  const handleSave = () => {
    setSaved(true);
    playSuccess();
    vibrate(80);
    addStars(3);
    addBadge('🎨 小画家');
    speak('好漂亮的作品！', 'zh-CN', 0.85);
  };

  const handleReset = () => {
    if (selectedTemplate) {
      playClick();
      initCanvas(selectedTemplate);
      setSaved(false);
    }
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-coral/10 via-background to-golden/10 pt-20 pb-8 px-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">🎨 涂色工厂</h1>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <XiaoZhaZha mood={saved ? 'excited' : 'happy'} size={50} />
          <div className="bg-card rounded-2xl px-4 py-2 shadow-sm max-w-xs">
            <p className="text-sm font-bold text-foreground">
              {!selectedTemplate ? '选一个道闸模板开始涂色吧！' : saved ? '好漂亮的作品！🎉' : '用手指画出漂亮的颜色！'}
            </p>
          </div>
        </div>

        {/* 模板选择 */}
        {!selectedTemplate && (
          <div className="max-w-md mx-auto grid grid-cols-5 gap-3 animate-pop-in">
            {templates.map(t => (
              <button key={t.id} onClick={() => { playClick(); setSelectedTemplate(t.id); }}
                className="touch-target rounded-2xl bg-card shadow-md p-3 flex flex-col items-center gap-1 hover:scale-110 active:scale-95 transition-all">
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-[10px] font-bold text-foreground">{t.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 画板 */}
        {selectedTemplate && (
          <div className="max-w-lg mx-auto animate-pop-in">
            <div className="bg-card rounded-3xl shadow-lg p-3 mb-4">
              <canvas
                ref={canvasRef}
                className="w-full rounded-2xl border-2 border-border touch-none"
                style={{ aspectRatio: '400/320' }}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
              />
            </div>

            {/* 工具栏 */}
            <div className="space-y-3">
              {/* 工具选择 */}
              <div className="flex gap-2 justify-center">
                {([['brush', '🖌️', '画笔'], ['eraser', '🧹', '橡皮'], ['sticker', '⭐', '贴纸']] as const).map(([t, e, n]) => (
                  <button key={t} onClick={() => { playClick(); setTool(t as any); }}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${tool === t ? 'bg-sky/30 ring-2 ring-sky' : 'bg-muted'}`}>
                    {e} {n}
                  </button>
                ))}
              </div>

              {/* 颜色 */}
              {tool !== 'sticker' && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {colors.map(c => (
                    <button key={c.hex} onClick={() => setCurrentColor(c.hex)}
                      className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-125 ${currentColor === c.hex ? 'ring-3 ring-foreground scale-110' : 'ring-1 ring-border'}`}
                      style={{ backgroundColor: c.hex }} aria-label={c.name} />
                  ))}
                </div>
              )}

              {/* 笔刷大小 */}
              {tool !== 'sticker' && (
                <div className="flex gap-3 justify-center items-center">
                  <span className="text-xs text-muted-foreground">笔刷：</span>
                  {brushSizes.map(s => (
                    <button key={s} onClick={() => setBrushSize(s)}
                      className={`rounded-full transition-all ${brushSize === s ? 'bg-foreground' : 'bg-muted-foreground/40'}`}
                      style={{ width: s + 10, height: s + 10 }} />
                  ))}
                </div>
              )}

              {/* 贴纸选择 */}
              {tool === 'sticker' && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {stickers.map(s => (
                    <button key={s} onClick={() => setSelectedSticker(s)}
                      className={`text-2xl rounded-lg p-1 transition-all ${selectedSticker === s ? 'bg-golden/30 ring-2 ring-golden scale-110' : ''}`}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* 操作 */}
              <div className="flex gap-3 justify-center">
                <button onClick={handleReset} className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-5 py-3 text-base font-bold transition-all active:scale-95">
                  🔄 重画
                </button>
                <button onClick={() => { playClick(); setSelectedTemplate(null); setSaved(false); }}
                  className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-5 py-3 text-base font-bold transition-all active:scale-95">
                  📋 换模板
                </button>
                <button onClick={handleSave}
                  className="touch-target rounded-2xl bg-gradient-to-r from-sky to-grass text-primary-foreground px-5 py-3 text-base font-black shadow-lg hover:scale-105 active:scale-95 transition-all">
                  💾 保存作品
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button onClick={() => { playClick(); navigate('/'); }} className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-6 py-3 text-lg font-bold transition-all active:scale-95">
            🏠 回到地图
          </button>
        </div>
      </div>
    </>
  );
};

export default ColoringPage;

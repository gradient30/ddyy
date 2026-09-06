# 道闸乐园 - 护眼设计系统 v1.0

> 创建时间：2026-03-03  
> 状态：✅ Phase 1 已完成

---

## 🎨 色彩系统

### 核心配色（护眼模式）

| Token | 色值 | 用途 |
|-------|------|------|
| `--background` | `hsl(45 30% 96%)` | 暖白背景，米纸质感 |
| `--foreground` | `hsl(30 25% 20%)` | 柔和深棕文字 |
| `--primary` | `hsl(160 35% 40%)` | 墨绿主色，舒缓视觉 |
| `--secondary` | `hsl(38 70% 58%)` | 暖黄次要色 |
| `--accent` | `hsl(145 40% 50%)` | 柔和绿色，成功状态 |
| `--destructive` | `hsl(5 60% 55%)` | 降低饱和度的红色 |
| `--muted` | `hsl(40 20% 90%)` | 禁用/次要背景 |
| `--border` | `hsl(40 20% 85%)` | 边框色 |

### 道闸乐园专属色

| Token | 色值 | 用途 |
|-------|------|------|
| `--sky-blue` | `hsl(190 50% 55%)` | 降低饱和度的天蓝 |
| `--golden` | `hsl(38 70% 58%)` | 暖黄色 |
| `--grass-green` | `hsl(145 40% 50%)` | 柔和草绿 |
| `--coral-red` | `hsl(5 60% 60%)` | 柔和珊瑚色 |
| `--purple-fun` | `hsl(270 40% 60%)` | 趣味紫（降饱和） |
| `--orange-warm` | `hsl(28 65% 58%)` | 温暖橙色 |

### 主题模式

```css
/* 默认护眼模式 */
:root { /* 暖白 + 墨绿 */ }

/* 夜间模式 - 深灰而非纯黑 */
.dark { /* 降低对比度 */ }

/* 护眼强化模式 */
.eye-care { /* 更暖更柔和 */ }

/* 纸质模式 - 模拟纸张 */
.paper-mode { /* 类似书籍阅读体验 */ }
```

---

## 🔤 字体系统

### 中文字体栈

```css
font-family:
  'PingFang SC',           /* macOS/iOS */
  'Hiragino Sans GB',      /* macOS备用 */
  'Microsoft YaHei',       /* Windows */
  'Noto Sans SC',          /* Android */
  'Source Han Sans SC',    /* 思源黑体备用 */
  'WenQuanYi Micro Hei',   /* Linux */
  'Nunito',                /* 拉丁字符 */
  sans-serif;
```

### 字号规范

| 级别 | 标准模式 | 幼儿模式 | 用途 |
|------|----------|----------|------|
| xs | 14px | 16px | 辅助文字，最小保护 |
| sm | 16px | 18px | 正文辅助 |
| base | 16px | 20px | 正文 |
| lg | 18px | 24px | 强调文字 |
| xl | 20px | 28px | 小标题 |
| 2xl | 24px | 32px | 标题 |

### 行高与间距

```css
line-height: 1.6;        /* 宽松行距 */
letter-spacing: 0.01em;  /* 微字母间距 */
```

---

## ✨ 动画系统

### 动画时长规范

| 类型 | 时长 | 用途 |
|------|------|------|
| 微交互 | 150ms | 按钮点击、状态切换 |
| 标准 | 250ms | 元素显示/隐藏 |
| 页面切换 | 300ms | 路由过渡 |
| 强调 | 350ms | 重要反馈 |
| 循环 | 2-4s | 漂浮、脉冲等 |

### 缓动函数

| 名称 | 值 | 用途 |
|------|-----|------|
| smooth | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 标准过渡 |
| bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性回弹 |

### 动画类

| 类名 | 描述 | 时长 |
|------|------|------|
| `.animate-float` | 柔和漂浮 | 4s |
| `.animate-wiggle` | 温和摇摆 | 2.5s |
| `.animate-pop-in` | 弹入 | 0.3s |
| `.animate-fade-in` | 淡入 | 0.3s |
| `.animate-slide-up` | 上滑入 | 0.3s |
| `.animate-bounce-gentle` | 轻柔弹跳 | 2.5s |
| `.animate-glow-pulse` | 发光脉冲 | 3s |

---

## 🎯 交互规范

### 触摸区域

| 类名 | 尺寸 | 用途 |
|------|------|------|
| `.touch-target` | 44×44px | 标准（WCAG 2.5.5） |
| `.touch-target-lg` | 56×56px | 幼儿模式 |
| `.touch-target-xl` | 70×70px | 高可访问性 |

### 焦点样式

```css
:focus-visible {
  outline: 3px solid hsl(var(--primary));
  outline-offset: 3px;
}
```

### 按钮状态

```css
/* 点击反馈 */
button:active, .btn-active {
  transform: scale(0.97);
  transition: transform 0.1s ease-out;
}
```

---

## ♿ 无障碍支持

### 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  /* 禁用非必要动画 */
}
```

### 高对比度模式

```css
.high-contrast {
  /* 黑白分明，2px边框 */
}
```

### 色盲友好

```css
.colorblind-friendly {
  /* 图案+颜色双重编码 */
}
```

### 屏幕阅读器

- `.sr-only` - 仅屏幕阅读器可见
- `.sr-only-focusable` - 聚焦时可见
- `.skip-link` - 跳转到主要内容

---

## 📱 响应式断点

| 断点 | 范围 | 设备 |
|------|------|------|
| 默认 | < 375px | 小手机 |
| sm | 376-428px | 标准手机 |
| md | 429-768px | 大手机/小平板 |
| lg | 769-1024px | 平板 |
| xl | > 1025px | 桌面 |

---

## 🔄 模式切换

### 幼儿模式 `.toddler-mode`

- 字体放大（基准18px）
- 动画放慢（+25%时长）
- 触摸区增大
- 简化界面元素

### 儿童模式（默认）

- 标准字号
- 完整动画
- 标准触摸区
- 完整功能

---

## 📦 使用示例

### 基础页面结构

```tsx
<div className="min-h-screen bg-background text-foreground font-chinese">
  {/* 跳过链接 */}
  <a href="#main" className="skip-link">跳转到主要内容</a>
  
  {/* 主内容 */}
  <main id="main" className="animate-fade-in">
    <h1 className="text-2xl font-bold">标题</h1>
    <p className="text-base leading-relaxed">正文内容...</p>
    
    <button className="touch-target-lg btn-primary">
      大按钮
    </button>
  </main>
</div>
```

### 应用模式

```tsx
// 在html或body上添加模式类
<html className="dark toddler-mode">
<html className="eye-care">
<html className="paper-mode">
```

---

## 📋 检查清单

### 开发前检查

- [ ] 配色是否符合护眼原则（暖白+墨绿）
- [ ] 字号是否不小于14px
- [ ] 触摸区是否不小于44px
- [ ] 动画是否支持 `prefers-reduced-motion`

### 开发后检查

- [ ] 高对比度模式是否正常
- [ ] 屏幕阅读器是否能正确朗读
- [ ] 键盘导航是否流畅
- [ ] 色盲用户是否能区分状态

---

## 🔄 变更日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-03-03 | v1.0 | 初始版本，护眼配色系统 |

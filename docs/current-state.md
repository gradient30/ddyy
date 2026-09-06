# 道闸乐园 — 当前实现掌握（以 main 为准）

> 对照交接方案通读 `main` 全部游戏页、上下文、存储与音视频后的事实记录。  
> 后续重构以本文为基线，不以 `plans/progress-report-*.md` 的完成声明为准。

## 1. 产品是什么

**道闸乐园（Barrier Buddies Adventure）** 是面向约 3–10 岁的儿童 STEM 互动乐园：以道闸为主题载体，把科学、工程、交通安全、语言、艺术、音乐、故事串成岛屿地图。

- **形态**：单页 React PWA 壳 + 多路由迷你游戏，无后端，进度写 `localStorage`
- **角色**：最多 3 个本地儿童档案；家长区用 PIN `1234` 进入
- **吉祥物**：小闸闸（`XiaoZhaZha`），头顶道闸臂
- **核心循环**：选档案 → 岛屿地图 → 完成关卡 → 星星 / 徽章 / 词汇 → 收藏馆 / 家长区

已确认的产品约束（来自交接方案，代码侧仍成立）：

| 项 | 决策 |
|----|------|
| 目标用户 | 分龄意图：幼儿 3–6、儿童 7–10（**main 未落地分龄**） |
| 地域 | 国内优先；语音现状是浏览器 Web Speech |
| 商业化 | 完全免费、无广告 |
| 护眼 | 设计系统已写；**main 仍是偏饱和的乐园配色** |

## 2. 技术栈

| 层 | 实际使用 |
|----|----------|
| 构建 | Vite 5 + `@vitejs/plugin-react-swc`，别名 `@/` |
| UI | React 18、React Router 6、Tailwind 3、shadcn/Radix（大量组件未在游戏中使用） |
| 状态 | 自研 `GameContext` + `localStorage`（`barrier-buddies-data`） |
| 语音 | `src/lib/speech.ts` → `window.speechSynthesis` |
| 音效 | `src/lib/sound.ts` → Web Audio 程序化合成 |
| 查询 | `@tanstack/react-query` 已挂 Provider，**没有任何 Query** |
| 测试 | Vitest + Testing Library，仅占位 `example.test.ts` |
| 部署 | GitHub Actions → Cloudflare Pages（`ddyy`）与 GitHub Pages |
| 未使用但写在 CI 里 | `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — 源码零引用 |

`package.json` 仍叫 `vite_react_shadcn_ts`。`index.html` 标题仍是「道闸入门」，未挂 `manifest.json`。

## 3. 运行时架构

```
main.tsx
  └── App
        QueryClientProvider          ← 空转
        GameProvider                 ← 唯一全局状态
          AppContent
            high-contrast class
            BrowserRouter + React.lazy 全页
              /            Index
                             isResting → RestMode
                             no profile → ProfileSelect
                             else → GlobalNav + IslandMap
              /welcome     WelcomePage
              /world-tour  WorldTourPage
              /lab         LabPage
              /factory     FactoryPage
              /traffic     TrafficPage
              /language    LanguagePage
              /coloring    ColoringPage
              /music       MusicPage
              /story       StoryPage
              /treasure    TreasurePage
              /collection  CollectionPage
              /parent      ParentPage
```

`PlaceholderPage` 被 lazy import，**没有任何 Route 使用**。

## 4. 数据契约（重构禁区）

`localStorage` key：`barrier-buddies-data`

```ts
ChildProfile {
  id, name, avatar,                    // 默认 宝宝1/2/3 + 🦁🐰🐻
  stars, badges[], learnedWords[],
  buildSuccessRate,                    // 只读展示，从未写入
  totalPlayMinutes,                    // 只读展示，从未写入
  createdAt, lastPlayedAt,             // lastPlayedAt 创建后不再更新
  settings: { language, voiceSpeed, restDuration }  // 从未被游戏读取
}

GameState {
  currentProfileId,
  profiles[3],
  globalSettings: {
    soundEnabled, voiceEnabled, vibrationEnabled,  // 会持久化，音视频层不检查
    highContrast,                                  // App.tsx 会加 class
    timerEnabled,                                  // GameContext 会启停计时
  }
}
```

奖励写入是 **同步、立即落盘** 的：`addStars` / `addBadge` / `addLearnedWord` 都在 `storage.ts` 里直接 `saveGameState`。

**没有 schema 迁移。** `loadGameState` 是裸 `JSON.parse`。改字段必须兼容旧存档。

会话态（刷新即丢）：世界巡游 `visited`、实验室 / 交通 / 寻宝 / 故事的 `completed`、涂色画布、音乐击打次数。

## 5. 岛屿与教学内容

地图 10 岛全部 `unlocked: true`，无渐进解锁。

| 岛 | 路由 | 教什么 | 奖励 | 约行数 |
|----|------|--------|------|--------|
| 欢迎岛 | `/welcome` | 小闸闸、中英问候、6 条道闸冷知识 | +1 星 | 231 |
| 世界巡游 | `/world-tour` | 15 国道闸类型 + 单题测验 | 新国家 +2 星；15/15 徽章 | 264 |
| 探秘实验室 | `/lab` | 解剖 / 杠杆 / 太阳能电机 / 传感器 | 每实验 2+预测加分；4/4 徽章 | 439 |
| 建造工厂 | `/factory` | 直臂/折臂/围栏，8 步引导或自由拼装 | 引导 5 星+徽章；自由 8 星+徽章 | 347 |
| 交通英雄城 | `/traffic` | 停车、红绿灯、数车、斑马线、躲避 | 每关 3 星；5/5 徽章。关卡词未写入词汇本 | 508 |
| 语言魔法屋 | `/language` | 20 词：配对 / 闪卡 / 拼写 | 每 5 分 +2 星；20 分徽章；仅闪卡记词 | 407 |
| 涂色工厂 | `/coloring` | 10 个模板 + 画笔/橡皮/贴纸 | 保存 +3 星+徽章；画作不落盘 | 513 |
| 音乐律动 | `/music` | 4 鼓垫 + 3 预设节奏，道闸随拍摆臂 | 每 20 击 +1 星；50 击徽章 | 225 |
| 故事王国 | `/story` | 5 个分支绘本（安全/修理/颜色/运动） | +3 星 + 路径徽章；5/4 元徽章 | 321 |
| 寻宝乐园 | `/treasure` | 5 场景找零件再装配 | +4 星；5/5 徽章 | 381 |

世界巡游 15 国：中国直臂、美国广告屏、日本折臂、澳洲太阳能、德国围栏、肯尼亚手动、阿联酋翻板、巴西彩色、印度铁路、法国升降柱、韩国车牌识别、埃及景区、加拿大加热、新加坡 ERP、墨西哥社区闸。

语言 20 词：车/门/停/行/红绿蓝黄/太阳/电/安全/大小/上下/开关/圆方/星。

## 6. 共享能力

| 模块 | 职责 | 被游戏使用？ |
|------|------|--------------|
| `GameContext` | 档案、奖励、15 分钟玩 / 10 分钟歇 | 是 |
| `speech.ts` | TTS + 移动端首次点击解锁 | 是（11+ 页） |
| `sound.ts` | click/success/error/star/lift + vibrate | 是 |
| `difficulty.ts` | 按成功率给 easy/medium/hard | **否，死代码** |
| `CountryBarrierSVG` | 15 国不同 SVG 道闸 | 世界巡游 |
| `LabScenes` / `TrafficScenes` / `TreasureScenes` | 场景 SVG | 对应页 |
| `RestMode` | 护眼操 + 一年级加减法家长解锁 | Index 覆盖 |
| `GlobalNav` | 回地图、倒计时、星星、退出 | 地图与多数游戏页 |
| `src/components/ui/*` | 完整 shadcn 套件 | 游戏几乎不用，自绘 button |

计时器硬编码 15 / 10 分钟，**忽略** `ChildProfile.settings.restDuration`。

## 7. 徽章系统（已知断裂）

游戏写入的是展示字符串；收藏馆用 slug 判断是否点亮。

| 游戏写入 | 收藏馆 id | 结果 |
|----------|-----------|------|
| `🌍 环球小旅行家` | `world-traveler` | 对不上 |
| `🏗️ 小小工程师` | `engineer`（名：小工程师） | 对不上 |
| `🔧 创意建造师` | `creative-builder` | 对不上 |
| `🎨 小画家` | `artist` | 对不上 |
| `交通小英雄` | `traffic-hero` | 对不上 |
| `小小科学家` | `scientist`（名：小科学家） | 对不上 |
| `语言小达人` | `linguist` | 对不上 |
| `节奏小鼓手` | `musician` / `drum-king` | 对不上 |
| `故事大王` | `storyteller` | 对不上 |
| `寻宝大师` | `treasure-hunter`（名：寻宝达人） | 对不上 |
| 故事路径徽章（绿灯小卫士等） | 无对应目录项 | 只涨数字 |

收藏馆墙因此几乎全灰，顶部「徽章数」却可能 > 0。`parking-master`、`early-bird`、`superstar` 等目录项没有任何授予点。

## 8. 家长设置的真实效力

| 开关 | 是否落盘 | 运行时是否生效 |
|------|----------|----------------|
| 声音 | 是 | `sound.ts` 不读 |
| 语音 | 是 | `speech.ts` 不读 |
| 振动 | 是 | `vibrate()` 不读 |
| 高对比度 | 是 | `App.tsx` 加 class |
| 用眼计时 | 是 | `GameContext` 启停 |
| 档案 language / voiceSpeed / restDuration | 默认写入 | 无人读取 |

PIN 明文写在 `ParentPage`。导出是未加密 JSON。

## 9. PWA / 发布现状（main）

- `public/manifest.json` 存在，**`index.html` 未 link**
- `public/sw.js` 存在，**没有任何注册代码**
- 部署工作流会 `vite build` 后推 Cloudflare Pages
- 工作流注入 Supabase 环境变量，应用不消费

## 10. 测试与质量闸门

- `npm test` 只有 `expect(true).toBe(true)`
- 没有页面级、存储迁移、徽章契约、语音开关的测试
- 后续重构必须先补契约测试，再动结构

## 11. 代码气味（按风险）

1. **God pages**：涂色 / 交通 / 实验室 / 语言 / 工厂均 340–510 行，数据 + 规则 + SVG + UI 搅在一起
2. **重复测验 UI**：世界巡游、实验室预测、交通 Why、故事思考题各自一份
3. **Emoji 当图形**：地图、贴纸、吉祥物眼睛
4. **交通关卡锁图标是假的**：显示 🔒，实际都可进
5. **MusicPage 每次击鼓 `new AudioContext()`**：泄漏风险
6. **StoryPage `handleFinish` 依赖 `completed.size`**：闭包陈旧风险
7. **工厂 `dragPart` 死状态**：「拖拽」实际是点击
8. **QueryClient / 大半 shadcn / PlaceholderPage**：死重量

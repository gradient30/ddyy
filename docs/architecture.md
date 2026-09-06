# 当前架构（以 main 为准）

本文描述 **2026-09 学前重构之后** 的系统。若与代码冲突，改本文。

## 1. 它是什么

单页 React PWA 壳 + 多路由活动页。无后端。三个本地儿童档案。主题是道闸，课程对照《3–6 岁儿童学习与发展指南》五大领域，并补上 4–7 岁数感分层。

| 层 | 实际使用 |
|----|----------|
| 构建 | Vite 5 + React 18 + SWC，别名 `@/` |
| 路由 | React Router 6，`basename` 来自 `VITE_BASE_URL` |
| 样式 | Tailwind 3；学前暖纸底 + 鼠尾草绿（`src/index.css`） |
| 状态 | `GameContext` + `localStorage` |
| 语音 | 预录 Xiaoyi/Jenny mp3，回退浏览器 TTS |
| 音效 | Web Audio 程序化合成（`sound.ts`） |
| 测试 | Vitest + jsdom + Testing Library |
| 查询 | `@tanstack/react-query` 已挂，**零 Query** |
| UI 套件 | `src/components/ui/*` 几乎不被游戏使用 |

## 2. 数据契约

`ChildProfile`：

- 身份：`id` `name` `avatar`
- 进度：`stars` `badges[]` `learnedWords[]` `completedStations[]` `knowledgeIds[]`
- 年龄：`ageBand` `ageChosen`（未选龄不得进地图）
- 空转字段：`buildSuccessRate` `totalPlayMinutes` `settings.language` `settings.restDuration`（写入默认值，游戏基本不读）
- `settings.voiceSpeed`：`GameContext` 会同步到 TTS 语速

`GameState.globalSettings`：

| 开关 | 运行时 |
|------|--------|
| sound / voice / vibrate | `audio-flags` → `sound.ts` / `speech.ts` |
| highContrast | `App.tsx` 加 class |
| timerEnabled | 15 分钟玩 / 10 分钟歇（硬编码，忽略档案 `restDuration`） |
| unlockAllStations | 地图跳过顺序锁 |

迁移：`migrateProfile` 补齐新字段，并把旧徽章字符串 `normalizeBadgeId`。**没有版本号。** 破坏性改字段会丢孩子进度。

## 3. 模块边界

```
src/data/*     课程真值（站点、年龄、词汇、徽章、语音表）
src/lib/*      存档、语音、音效、basename
src/contexts   GameProvider：进度 API + 护眼计时
src/pages/*    一站一页（表达站拆成入口+三房间）
src/components/layout/GameLayout.tsx   儿童页壳：回小路、领域、今日目标、小闸闸
src/components/map/IslandMap.tsx       成长小路
src/components/parts/*                 工厂/寻宝零件图
src/components/scenes/*                实验/交通/寻宝 SVG
src/test/*                             契约与回归，不是页面故事
```

新增教学内容：先改 `src/data`，再改对应页，最后补 `src/test/contracts.test.ts` 会扫到的调用。

## 4. 年龄如何进游戏

`getAgeConfig(band)` 被各页读取，而不是复制数字。

| 能力 | 萌芽 | 探索 | 建构 |
|------|------|------|------|
| 选项数 | 2 | 3 | 4 |
| 点数上限 | 5 | 10 | 20 |
| 英语 | 否 | 是 | 是 |
| 交通关 / 国家 / 寻宝关 | 2 / 5 / 2 | 4 / 10 / 4 | 5 / 15 / 5 |
| 拼写、驾驶、加减 | 否 | 否 | 是 |

表达舞台：萌芽只开涂色；探索起开节奏；建构开故事。

## 5. 音视频管道

```
家长开关 → GameContext.syncAudioFlags
                ↓
           audio-flags 模块状态
                ↓
     sound.ts 检查 sound/vibrate
     speech.ts 检查 voice
                ↓
     AUDIO_MANIFEST 命中 → <audio src="{BASE_URL}audio/...mp3">
     未命中或播放失败 → speechSynthesis（优先 Xiaoyi / Jenny）
```

`scripts/generate-voice.py` 是 clip 的唯一源。hash 文件名 = `md5(lang|text)[:12]`。

## 6. 部署

- `main` 推送并行发 GitHub Pages 与 Cloudflare Pages
- Pages 构建注入 `VITE_BASE_URL=/ddyy/`
- CI 工作流 `ci.yml` 在 PR 上跑 typecheck / test / lint / 双 base 构建
- 工作流仍声明 `VITE_SUPABASE_*`，源码零引用
- `public/sw.js` 存在，**未注册**；`manifest.json` 已 link，图标仍是 favicon

## 7. 已知空转（不是本轮范围）

- `src/lib/difficulty.ts` 无人调用
- `PlaceholderPage` 无路由
- `QueryClient` 与大半 shadcn 是 Lovable 遗留
- 档案 `buildSuccessRate` / `totalPlayMinutes` 只展示不累计
- 数学站、表达站「完成」偏松（一活动即可）
- PIN 明文；导出 JSON 未加密

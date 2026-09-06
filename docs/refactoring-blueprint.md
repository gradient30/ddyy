# 道闸乐园 — 重构蓝图

本蓝图建立在 [`current-state.md`](current-state.md) 与 [`gap-analysis.md`](gap-analysis.md) 之上。  
目标不是重写产品，而是把「能玩的 10 岛乐园」收成可扩展、可测试、不破坏存档的结构，再谈新岛屿与云同步。

## 0. 硬原则

1. **从 `main` 出发。** `origin/dev` 只作素材库。
2. **一次一事。** 每个 PR 只动一层（契约 / 数据 / 壳 / 单岛），禁止「顺手」改玩法。
3. **先测契约再拆文件。** 没有徽章 / 存档 / 设置开关测试，不准改 `storage.ts` 形状。
4. **存档兼容。** `barrier-buddies-data` 是用户资产。改 schema 必须 `loadGameState` 补默认值；改徽章 id 必须能认旧字符串。
5. **游戏页保持可玩。** 重构中途任何岛应仍能走完一条主路径。
6. **不引入未接线的新抽象。** 没有第二个调用方，就不抽框架。
7. **不加密、不上云、不换语音供应商**，直到本地循环（设置生效、徽章点亮、进度可恢复）稳定。
8. **儿童安全。** 家长 PIN、导出数据、第三方脚本保持最小；禁止把孩子姓名打到远程日志。

## 1. 绝对不要先做的事

| 冲动 | 为什么不做 |
|------|------------|
| merge `origin/dev` | `App.tsx` 损坏；大量死代码；schema 无迁移 |
| 用 `encryption.ts` 包一层 localStorage | 无密钥备份 = 丢档 |
| 把 10 个页面一次性拆成 hooks | 无法回归，玩法细节会丢 |
| 先做数学岛 / 环保岛 | 新岛会复制当前坏结构（徽章串、会话进度、设置空转） |
| 先接讯飞 / Supabase | 本地开关还没接到 `speak` / `playClick` |
| 删 shadcn 全家桶（第一波） | 与玩法无关，容易制造无意义 diff |

## 2. 重构阶段（按依赖，不按日历）

### R0 — 冻结契约（必须最先做）

把「口头约定」写成代码里的唯一真相，并补最小测试。

**范围：**

- `src/data/badges.ts`：目录 id、中文名、授予点、兼容别名
- `addBadge` 只接受目录 id；收藏馆 `earnedBadges.includes(badge.id)`
- `loadGameState`：对缺字段做 default merge（为以后加 `ageGroup` 做准备）
- `speech.ts` / `sound.ts` / `vibrate` 读取 `globalSettings`（通过显式参数或轻量 getter，避免循环依赖）
- `index.html`：标题、描述、`lang="zh-CN"`、link `manifest.json`
- 删掉或真正使用 `PlaceholderPage` 的 lazy import

**验收：**

- 用旧存档（徽章是 `🌍 环球小旅行家`）打开收藏馆，对应格点亮
- 家长关闭「语音」后，`speak()` 立即 no-op
- `vitest` 覆盖：徽章别名迁移、settings merge、开关门闩

**风险：** 已有用户存档里的中文徽章串。必须保留别名表，不能只改授予点。

### R1 — 抽出领域数据，不改玩法

把硬编码表从 God page 挪走，页面行为保持像素级一致。

| 抽出到 | 来源 |
|--------|------|
| `src/data/islands.ts` | `IslandMap` |
| `src/data/countries.ts` | `WorldTourPage` |
| `src/data/vocab.ts` | `LanguagePage`（交通关卡词应对齐同一本词典） |
| `src/data/stories.ts` | `StoryPage` |
| `src/data/experiments.ts` | `LabPage` |
| `src/data/treasure-levels.ts` | `TreasurePage` |
| `src/data/coloring-templates.ts` | 仅元数据；绘制函数可后置 |

**验收：** 各岛主路径与重构前一致；diff 以「移动」为主，不改文案逻辑。

### R2 — 游戏壳与共享交互

在数据稳定后，消掉复制的壳。

- `GameLayout`：回地图、GlobalNav、RestMode 守卫、标题区
- `QuizChoices`：四选一 / 对错反馈 / 朗读题面（世界巡游、实验室、交通 Why、故事思考）
- `RewardBurst`：星星 + 可选徽章，统一走 R0 API
- 可选：把 `completed` / `visited` 按档案写入 storage（**新字段，要 merge**），刷新不丢岛内进度

**不要**在这一步接入 `ButtonFeedback` / 手势 / 路由过渡。壳先统一，再谈装饰。

### R3 — 让分龄与难度真正发生

此时才适合吸收 `origin/dev` 的分龄设计。

- `ChildProfile.ageGroup: 'toddler' | 'child'`，`loadGameState` 缺省 `'child'`
- `ProfileSelect` 可选年龄；`ParentPage` 用 Context API 改，**禁止** `location.reload()`
- `useAgeGroup` 输出给游戏的是 **数值与规则**（选项数、是否拼写、触摸区、语速），不是只挂 CSS class
- **接上** 现有 `difficulty.ts`，或删掉其中一个，禁止两套并存
- 幼儿版明确降载：交通「小司机」可关、拼写可藏、测验 2 选项

护眼 token 从 `origin/dev` 的 `index.css` 按设计系统 cherry-pick，并在家长区开关。与现有岛屿渐变并存时，先做 `.eye-care` 覆盖，不要一次改掉所有 `from-coral`。

### R4 — PWA 与性能（薄接入）

- `index.html` 已有 manifest 的前提下，**只注册一个** SW
- 优先修好 `public/sw.js` 的 cache 名与离线回退；`sw-enhanced.js` 仅在单测 / 本地对比后再替换
- 保持现有 `React.lazy` 即可；不要再包一层未使用的 `LazyRoute`
- `npm run build` 必须绿

### R5 — 内容扩展（方案里的新岛）

只有 R0–R2 完成后才开新岛，否则数学岛会再复制 400 行 God page。

顺序建议：

1. 数学逻辑岛（计数 / 模式，复用 `QuizChoices` + `difficulty.ts`）
2. 环保能源岛（可复用实验室场景模式）
3. 每日挑战（读已有岛的小题，不要新引擎）
4. 成就 2.0 分类与等级头衔（建立在 R0 徽章目录上）

AI 岛、关卡编辑器、多人、云同步：仍按原方案留在更后。没有本地账号模型时不要做「家长监控 Web」。

## 3. 单岛拆分时的安全拆法

对 Coloring / Traffic / Lab / Language / Factory：

```
pages/TrafficPage.tsx          路由 + 关卡状态机（尽量 <200 行）
features/traffic/levels.ts     关卡数据
features/traffic/Parking.tsx   单关 UI
features/traffic/WhyPrompt.tsx 复用 QuizChoices
```

一次只拆一个岛。拆完必须手玩：进关 → 完成 → 星星增加 → 回地图 → 再进（若已做进度持久化则状态还在）。

## 4. 依赖与循环注意点

```
pages  →  features  →  data
  │           │
  └── GameContext → storage → (未来) migrate
  └── speech/sound  →  settings reader
```

- 不要让 `storage.ts` import React hooks
- 不要让 `speech.ts` import `GameContext`（会循环）；用 `getAudioFlags()` 或把 `speak` 包一层 hook `useSpeak()`
- 徽章目录不要放进 Context，避免整树重渲

## 5. 回归清单（每个重构 PR）

最低手玩路径：

1. 选档案 → 地图 10 岛都在
2. 欢迎岛走到「出发」→ 星星 +1
3. 世界巡游答对 1 国 → 星星 +2
4. 打开收藏馆 → 对应徽章格状态正确
5. 家长区关语音 → 再进语言岛，不应出声
6. 开着用眼计时等到休息（可用临时改时长的测试开关，**不要把 15 分钟写死到测试里还真等**）
7. `npm run build` 与 `npm test` 通过

浏览器：桌面 + 窄屏（约 375px）。地图绝对定位在小屏上本来就挤，R2 之前不要「顺便重做地图」。

## 6. 给下一轮执行者的第一刀

若只做一个 PR，做 **R0**：徽章目录 + 存档 merge + 音视频开关 + 契约测试。

这是唯一同时满足「用户可感知修好了」和「后面所有岛都受益」的切口。不要从「先把 FactoryPage 拆成 8 个文件」开始。

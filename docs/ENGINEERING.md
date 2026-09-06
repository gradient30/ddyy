# 道闸成长小路 · 工程手册

这是仓库的系统说明书。后续改课、改交互、改部署，先读这一份，再动代码。

产品给 **4–7 岁** 学前儿童：以道闸为主题，把观察、数感、语言、安全、科学、工程、表达排成一条必须按序解锁的成长小路。免费、无广告、无账号，进度只存在本机 `localStorage`。

对照《3–6 岁儿童学习与发展指南》五大领域，并补上 4–7 岁数感分层。课程源数据在 `src/data/curriculum.ts`。

---

## 1. 系统地图

```text
选小朋友 → 选年龄层 → 成长小路地图
                ↓
     按序进入站点页（一站一件事）
                ↓
     通关写入：星星 / 徽章 / 本领 / 已走站点
                ↓
     成长手册展示；家长区看总览与开关
```

没有后端。`@tanstack/react-query` 只是脚手架残留，页面不请求远程 API。CI 里的 `VITE_SUPABASE_*` 目前没有对应代码。

| 层 | 目录 | 职责 |
|---|---|---|
| 入口 | `src/main.tsx` `src/App.tsx` | 挂载、懒加载路由、高对比度根类 |
| 状态 | `src/contexts/GameContext.tsx` | 档案、进度、全局设置、15/10 分钟作息 |
| 持久化 | `src/lib/storage.ts` | `barrier-buddies-data`，含旧存档迁移 |
| 课程 | `src/data/*` | 年龄、站点、本领、徽章、词汇、语音清单、通关契约 |
| 站点 | `src/pages/*` | 一页一玩法；通关必须走 Context 写入 |
| 壳 | `src/components/layout` `map` `nav` `profile` `mascot` | 地图、顶栏、档案、小闸闸 |
| 感官 | `src/lib/speech.ts` `sound.ts` `audio-flags.ts` | 预录 mp3 → TTS 回退；程序化音效 |
| 场景图 | `src/components/scenes` `barriers` `parts` | SVG，避免只靠 emoji |

别名：`@/` → `src/`。UI 组件在 `src/components/ui/`（shadcn 库存，多数站点页不用）。

---

## 2. 成长小路契约

`STATIONS` 的顺序就是解锁顺序。`isStationUnlocked`：第一站永远开；否则必须完成上一站。家长可开 `unlockAllStations`。

| 顺序 | stationId | 路由 | 页面 | 通关条件（摘要） |
|---|---|---|---|---|
| 1 | `welcome` | `/welcome` | `WelcomePage` | 听完招呼后点出发 |
| 2 | `observe` | `/treasure` | `TreasurePage` | 完成该年龄层全部寻找关 |
| 3 | `math` | `/math` | `MathPage` | 任一数感活动连续对 5 题 |
| 4 | `language` | `/language` | `LanguagePage` | 累计答对 8 次 |
| 5 | `safety` | `/traffic` | `TrafficPage` | 完成该年龄层全部安全关 |
| 6 | `science` | `/lab` | `LabPage` | 做完 4 个实验 |
| 7 | `engineer` | `/factory` | `FactoryPage` | 教程 8 步或自由组装完成 |
| 8 | `express` | `/express` | `ExpressPage` 门户 | 涂色 / 节奏 / 故事任一完成即记站 |
| 9 | `world` | `/world-tour` | `WorldTourPage` | 看完该年龄层全部国家 |

表达站另有子路由：`/coloring` `/music` `/story`。手册 `/collection`，家长 `/parent`。

通关写入必须同时想清楚四件事（实现上允许子集，但 id 必须在目录里）：

1. `completeStation(stationId)` — id 必须是上表 `stationId`
2. `addBadge(...)` — 必须是 `src/data/badges.ts` 的 id（旧中文名会经 `normalizeBadgeId` 映射）
3. `addKnowledge(...)` — 必须是 `KNOWLEDGE` 的 id
4. `addStars(n)` — 只加在当前档案

可颁发集合写在 `src/data/progress.ts` 的 `STATION_AWARDS`。合同测试会扫页面源码，防止写出错站、错徽章、错本领。

当前产品语义（改课前先确认，不要 silently 改）：

- **数感站**：完成任意一个活动就会 `completeStation('math')`，不是五个活动都做完。
- **表达站**：涂色、打节拍、听故事任一完成都会记 `express`。萌芽层只开放涂色。
- **徽章去重**：同一 id 只存一次；旧存档里的「环球小旅行家」等别名加载时会改成稳定 id。

---

## 3. 年龄分层

三档，存在每位小朋友的 `ageBand`。未选年龄时首页停在 `ProfileSelect`，`ageChosen === false`。缺省配置按 **探索** 处理。

| 档 | 岁 | 选项数 | 点数上限 | 英语 | 拼写 | 加减 | 交通关 | 世界点 |
|---|---|---|---|---|---|---|---|---|
| 萌芽 `sprout` | 4–5 | 2 | 5 | 否 | 否 | 否 | 2 | 5 |
| 探索 `explorer` | 5–6 | 3 | 10 | 是 | 否 | 否 | 4 | 10 |
| 建构 `builder` | 6–7 | 4 | 20 | 是 | 是 | 是 | 5 | 15 |

站点页必须 `getAgeConfig(currentProfile?.ageBand)`，不要在页面里再写一套岁数 if。新玩法先加 `AgeConfig` 字段，再在页面读取。

`src/lib/difficulty.ts` 是按成功率调节的另一套难度，**目前没有站点接入**。不要和年龄层混用；要启用先写合同测试，再接到具体一站。

---

## 4. 状态与存档

`GameState`：

- `currentProfileId`：未选档案为 `null`，首页只显示选小朋友
- `profiles[]`：默认小狮 / 小兔 / 小熊
- `globalSettings`：音效、语音、振动、高对比、定时休息、开放全部站点

每位小朋友：`stars` `badges` `learnedWords` `completedStations` `knowledgeIds` `ageBand` `ageChosen`，以及尚未真正驱动玩法的 `buildSuccessRate` / `totalPlayMinutes` / `settings.language` / `settings.restDuration`。

存档键：`barrier-buddies-data`。`loadGameState` 必须能吞掉缺字段的旧 JSON 和坏 JSON。家长区可导出 JSON；没有导入。

Context 里作息：玩 15 分钟 → 休息 10 分钟（`RestMode`），与档案里的 `restDuration` 尚未打通。

---

## 5. 语音与音效

`speak(text, lang)`：

1. `voiceEnabled === false` 则静音
2. 命中 `AUDIO_MANIFEST["zh-CN|原文"]` 则播 `public/audio/...mp3`
3. 否则 Web Speech TTS；中文优先 Xiaoyi 一类童声

移动端必须先有一次点击才能出声（欢迎站「点一下，小闸闸开始说话」）。全局在首次 pointer/touch/click 时 unlock。

**改口播流程（缺一步就会出现「有的句子是预录、有的是机器音」）：**

1. 把原文加进 `scripts/generate-voice.py` 的 `ZH` 或 `EN`（必须与页面 `speak(...)` 字符串完全一致）
2. 运行 `python scripts/generate-voice.py`（`edge-tts`，中文 `zh-CN-XiaoyiNeural`，语速 `-15%`）
3. 提交更新后的 `src/data/audio-manifest.ts` 和 `public/audio/`

音效走 Web Audio 振荡器，受 `soundEnabled` 控制。振动受 `vibrationEnabled` 控制。

---

## 6. 路由与发布

`BrowserRouter` 的 basename 来自 `VITE_BASE_URL`：

- 本地 / Cloudflare：`/`
- GitHub Pages：`/ddyy/`

项目级 Pages 没有 SPA fallback：`public/404.html` 把 `/ddyy/welcome` 折成 `/?/welcome`，`index.html` 再还原。改仓库名必须同时改 workflow 里的 `VITE_BASE_URL` 和 `404.html` 的 `pathSegmentsToKeep`。

| 目标 | Workflow | 触发 | 基路径 |
|---|---|---|---|
| 质量门禁 | `.github/workflows/quality.yml` | PR 与 `main` | 构建用 `/ddyy/` |
| GitHub Pages | `deploy-pages.yml` | push `main` | `/ddyy/` |
| Cloudflare Pages | `deploy-cloudflare.yml` | push `main` | `/` |

两条发布流水线都会先跑测试再构建。Cloudflare 需要 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

`public/sw.js` 存在但前端没有 `register`。`public/manifest.json` 的 `start_url` 仍是 `/`，在 Pages 子路径上不准确。

---

## 7. 质量门禁

本地：

```sh
npm install
npm test          # 领域合同 + 存档迁移 + 零件/语音清单
npm run build
npm run lint      # 历史债未清，不作为发布阻断
```

测试必须守住的不变量：

- 9 站顺序、解锁、推荐下一站
- 站点 / 徽章 / 本领 id 闭环（`src/test/contracts.test.ts`）
- 页面 `completeStation` / `addBadge` / `addKnowledge` 不写出目录
- 旧存档能迁到 `ageBand` + 稳定徽章 id
- 无当前档案时进度写入是空操作
- `AUDIO_MANIFEST` 指向的 mp3 文件真实存在
- GitHub Pages basename 去掉尾斜杠
- 工厂/寻宝用到的零件 id 都有 SVG

改课程、改通关、改存档字段：先改 `src/data/*` 和测试，再改页面。

---

## 8. 迭代纪律

1. **一站一件事。** 不要在一个站点里塞第二套课程目标；新目标先成为 `STATIONS` 里的一站或表达子门。
2. **年龄层是第一难度轴。** 题目数量、选项、是否出现英语/拼写/加减，只从 `AgeConfig` 读。
3. **进度 id 冻结。** 改 `stationId` / badge id / knowledge id 等于改存档协议，必须写迁移并补测试。
4. **口播原文冻结。** 改 `speak` 字符串必须同步预录，否则孩子会听到两种声音。
5. **触控优先。** 可点区域用 `touch-target` / `kid-btn`；不要依赖 hover 才出现的关键操作。
6. **科学事实要对。** 杠杆是「施力点离支点越远越省力」。`curriculum.test.ts` 已锁实验室文案。
7. **不要为了用组件库而用。** 新 UI 优先复用 `GameLayout`、`soft-card`、`kid-btn`。
8. **发布前跑测试。** 质量 workflow 失败的 PR 不要合并。

---

## 9. 已知债务（有意留下）

按影响排序，下一次动到相关文件时再收，不要做无关大扫除。

| 债务 | 位置 | 说明 |
|---|---|---|
| ESLint 16 error | `sound.ts` 空 catch、部分 shadcn、Music/Coloring | 不阻断发布；动到该文件时顺手修 |
| 难度模块未接入 | `src/lib/difficulty.ts` | 与年龄层重叠，接入前先定规则 |
| 档案字段空转 | `buildSuccessRate` `totalPlayMinutes` `settings.language` | 家长区没有对应展示/控制 |
| 作息写死 15/10 | `GameContext` | 与 `settings.restDuration` 未打通 |
| Query 脚手架 | `App.tsx` | 无请求，可删 |
| 占位页 | `PlaceholderPage.tsx` | 无路由 |
| Service worker 未注册 | `public/sw.js` | 且会全量缓存，子路径上不安全 |
| 家长密码写死 `1234` | `ParentPage` | 仅防误触，不是安全边界 |
| TypeScript 非 strict | `tsconfig*.json` | 渐进打开，不要一次全开 |
| 双锁文件 | `package-lock.json` + `bun.lockb` | CI 以 npm 为准 |
| 实验室完成条件 | `LabPage` | 萌芽层也要做完 4 个实验，与年龄层不完全对齐 |
| 交通「为什么」 | `TrafficPage` | 通关前有提问，但提问不区分对错 |

---

## 10. 改一类需求时先看哪里

| 你想改 | 先打开 |
|---|---|
| 增删站点 / 改解锁 | `curriculum.ts` → `progress.ts` → `App.tsx` → `IslandMap` → 合同测试 |
| 年龄层题目量 | `age.ts` → 对应站点页 → `age.test.ts` |
| 徽章或本领文案 | `badges.ts` / `curriculum.ts` `KNOWLEDGE` → 成长手册 |
| 通关送什么 | `progress.ts` + 该站点页的 `completeStation` 一段 |
| 口播句子 | 页面 `speak(...)` + `generate-voice.py` |
| 零件外观 | `PartIcons.tsx` + `parts.test.ts` |
| 存档兼容 | `storage.ts` + `storage.test.ts` |
| Pages 404 / 子路径 | `vite.config.ts` `404.html` `utils.ts` `deploy-pages.yml` |
| 家长开关 | `ParentPage` + `GameState.globalSettings` |

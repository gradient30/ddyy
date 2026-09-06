# 道闸成长小路 — Agent 操作系统

后续迭代以 **`main` 上的真实代码** 为准。读完本文再改代码。

历史文档 [PR #1](https://github.com/gradient30/ddyy/pull/1)（`docs/current-state.md` 等）写于学前重构之前，**已作废**。不要整支合并 `origin/dev`：那是未接线的脚手架，`App.tsx` 无法构建。

## 产品

给 **4–7 岁** 的学前互动课。道闸是载体，不是产品本身。教观察、数感、语言、安全、科学、表达。免费、无广告、无账号、进度只在本机。

核心循环：

1. 选小朋友（小狮 / 小兔 / 小熊）
2. 选年龄层：**萌芽 4–5 / 探索 5–6 / 建构 6–7**（`ageChosen` 为假时不能进小路）
3. 按 9 站顺序解锁，每站只学一件刚刚好的事
4. 本领、徽章、词汇写入成长手册

家长区 PIN 默认 `1234`。可关声音/语音/振动/计时，或「开放全部站点」。

## 权威数据（改行为先改这里）

| 契约 | 文件 | 规则 |
|------|------|------|
| 小路站点与解锁 | `src/data/curriculum.ts` | 9 站固定顺序；`completeStation(id)` 的 id 必须是 `STATIONS[].id` |
| 年龄层能力 | `src/data/age.ts` | 选项数、点数上限、英语、拼写、驾驶、加减都由这里门控 |
| 词汇 | `src/data/vocab.ts` | 用 `minBand` 分层，不要在页面里另写一份词表 |
| 徽章 | `src/data/badges.ts` | 写入 slug；旧中文/emoji 只走 `aliases` |
| 语音 clip | `scripts/generate-voice.py` → `src/data/audio-manifest.ts` | 新台词先加进脚本再生成；`speak()` 按「lang\|原文」精确匹配 |

存档 key：`localStorage['barrier-buddies-data']`。`loadGameState` 必须能吞掉旧档。改字段只能加、不能改名删掉。

## 运行时骨架

```
main.tsx
  App
    QueryClientProvider          ← 空转，不要往上堆业务
    GameProvider                 ← 唯一全局状态
      BrowserRouter basename=VITE_BASE_URL
        /            选人 → 选龄 → 小路（IslandMap）
        /welcome     欢迎小屋
        /treasure    观察花园
        /math        数感小岛
        /language    语言小屋
        /traffic     安全街道
        /lab         科学小屋
        /factory     工程工坊
        /express     表达舞台入口
        /coloring /music /story   表达三个房间
        /world-tour  世界花园
        /collection  成长手册
        /parent      家长区
```

进度只通过 `useGame()`：`addStars` / `addBadge` / `addLearnedWord` / `addKnowledge` / `completeStation`。它们同步写盘。

会话态（刷新即丢）可以丢：各页关卡进度、涂色画布、击鼓次数。孩子跨天要还在的东西必须进存档。

## 站点完成（现状，不要「顺便改严」）

| 站 id | 页面 | 何时 `completeStation` |
|-------|------|------------------------|
| `welcome` | WelcomePage | 听完出发 |
| `observe` | TreasurePage | 找齐并装完当前年龄层全部关 |
| `math` | MathPage | **任意一个**活动连对 5 题 |
| `language` | LanguagePage | 累计答对 8 次 |
| `safety` | TrafficPage | 打完当前年龄层全部关 |
| `science` | LabPage | 做完 4 个实验 |
| `engineer` | FactoryPage | 引导 8 步或自由拼装完成 |
| `express` | 涂色 / 音乐 / 故事 | **任一房间**完成后整站完成 |
| `world` | WorldTourPage | 看完当前年龄层全部国家 |

地图按 `STATIONS` 顺序解锁。家长 `unlockAllStations` 可跳过顺序，但不自动标完成。

## 语音

`speak(text, lang)`：先查 `AUDIO_MANIFEST['zh-CN\|'+text]` 播 mp3，失败再 Web Speech。家长关语音后必须静音（`audio-flags`）。

新增或改台词：

1. 把**完全相同**的字符串写入 `scripts/generate-voice.py` 的 `ZH` / `EN`
2. 跑 `python3 scripts/generate-voice.py`（需 `edge-tts`）
3. 提交 mp3 + 更新后的 `audio-manifest.ts`

不要手改 manifest。移动端必须先有一次点击才能出声（已在 `speech.ts` 解锁）。

## 发布

| 目标 | `VITE_BASE_URL` | 路由 |
|------|-----------------|------|
| GitHub Pages | `/ddyy/` | `BrowserRouter` basename `/ddyy`；深链靠 `public/404.html` |
| Cloudflare Pages | `/` | 根路径 |

改仓库名或 Pages 类型时，同步 `deploy-pages.yml`、`404.html` 的 `pathSegmentsToKeep`、以及 basename 测试。

## 迭代禁区

- 不要为了「完整」合并 `origin/dev` 或 Lovable 历史方案
- 不要加后端、账号、广告、付费墙、讯飞/加密云同步（除非产品明确改方向）
- 不要把题目做成阅读理解；4–7 岁以听、看、点为主
- 不要写错科学事实（杠杆：推的地方离支点越远越省力，不是重物越远越省力）
- 不要把 shadcn 整套搬进儿童页；儿童 UI 用现有 `kid-btn` / `soft-card` / `GameLayout`
- 不要在 `install`/一次性脚本里起开发服务器

## 改完怎么验

按改动类型走 `docs/iteration.md`。最低限度：

```sh
npm run ci
```

儿童页改了交互或样式时，还要在浏览器走通：选萌芽 → 上锁小路 → 改动的那一站 → 成长手册数字一致。

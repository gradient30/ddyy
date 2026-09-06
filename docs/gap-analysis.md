# 交接方案 vs 代码：差距清单

交接工程方案在 `origin/dev`（提交 `0e156fa`，标题 *Phase 1-5 completed*）。  
`main` 停在该提交之前。两边的**游戏页几乎相同**；`origin/dev` 多的是一层脚手架，以及一份声称「五阶段已完成」的文档。

## 1. 分支关系

```
main   ── 可构建、可玩的内容主干
           └── origin/dev = main + Phase 1–5 脚手架 + plans/
```

`origin/dev` **不能生产构建**：`src/App.tsx` 的 `AnimatedRoutes` 在 `</Routes>` 之后多写了 `</Suspense></BrowserRouter>`，JSX 结构损坏。

结论：**后续重构从 `main` 出发。禁止整支合并 `origin/dev`。** 需要的能力按文件 cherry-pick，并先修再接。

## 2. 方案完成声明 vs 接入事实

| 方案声称 | 代码事实 |
|----------|----------|
| Phase 1 护眼视觉 100% | `origin/dev` 的 `index.css` / Tailwind token 已写；**游戏页未改配色，main 仍是乐园饱和色** |
| Phase 2 分龄 100%，难度自适应 | `ChildProfile.ageGroup` + `useAgeGroupStyles` 只在 `App.tsx` 挂 class；**没有任何游戏按年龄改关卡**。`difficulty.ts` 与 `getDifficultyForAgeGroup` 都是死代码 |
| Phase 3 按钮反馈 / 手势 / 转场已完成 | 组件文件存在；**游戏页仍用原生 `<button>`**。`use-gestures.ts` 零引用。`PageTransition` 包装器未包路由，只有一条顶部进度条意图 |
| Phase 4 讯飞语音 / 加密存储已完成 | `voice-service.ts`、`encryption.ts` **零业务引用**。TTS 仍走 `speech.ts`。存档仍是明文 JSON。`voice-config.ts` 还引用了不存在的类型 `VoiceServiceConfig` |
| Phase 5 PWA 已完成 | `sw-enhanced.js` + `offline.html` + 安装提示已写；`main.tsx` 与 `useServiceWorker()` **双重注册**。`LazyImage` / `LazyRoute` 未被路由使用（路由已是 `React.lazy`） |
| 家长开关控制声音 / 语音 / 振动 | 只写 localStorage，音视频层不读 |
| 成就系统 2.0 / 每日挑战 / 数学岛 / 环保岛 | 方案里的规划，**两边都未实现** |
| 云同步 / Firebase / Supabase | 方案远期项。CI 有 Supabase secret 名，源码无客户端 |

## 3. origin/dev 新增文件的去留建议

| 文件 | 建议 |
|------|------|
| `plans/*` | **保留为历史方案**（本仓库已归档） |
| `src/index.css` 护眼 token、`.toddler-mode` | 可 cherry-pick，但要过一遍与现有乐园色冲突 |
| `src/hooks/use-age-group.ts` | 可留，必须先修默认值合并，再让游戏真正消费 |
| `src/lib/storage.ts` 的 ageGroup 字段 | 必须带 `loadGameState` 迁移后再加 |
| `GameContext` 的 `updateProfileAgeGroup` / `isToddlerMode` | 可留；游戏未读则等于没做 |
| `ProfileSelect` 两步选年龄 | 可 cherry-pick，注意别丢掉现有欢迎语音 |
| `ParentPage` 护眼/纸质/色盲开关 | 可留；**不要**再抄它的 `window.location.reload()` |
| `PageTransition` / `ButtonFeedback` / `LoadingStates` | 先不进主干。等游戏壳统一后再按需用 1–2 个，避免再堆未接线组件 |
| `use-gestures.ts` | 幼儿版需要明确手势表后再接；不要为接而接 |
| `voice-service.ts` / `voice-config.ts` / `server/xunfei-proxy.example.js` | 暂不合并。先让 `speech.ts` 尊重 `voiceEnabled` / `voiceSpeed` |
| `encryption.ts` | **不要**在没有密钥备份与恢复路径时加密存档，否则清站点数据 = 丢进度 |
| `performance.ts` | 与手写 debounce 重复，按需抽函数即可，不必整文件进 |
| `sw-enhanced.js` + PWA 组件 | 只保留 **一处** 注册；先让 `index.html` 挂上现有 `manifest.json` |
| `PrivacyPage` | 可单独进路由，与游戏解耦 |
| `App.tsx`（dev） | **禁止原样合并** |

## 4. 方案内部自相矛盾（读方案时必须知道）

1. `plans/plan.md` 正文表格仍写 Phase 3–5「待开始」，文末又写「当前 Phase 2 分龄 60%」；进度报告与 commit message 则写「Phase 1–5 全部完成」。
2. 设计系统断点（375 / 428 / 768 / 1024）与 Tailwind 默认 `sm/md/lg` 不是同一套，游戏页混用 `md:`。
3. 成就 2.0 规划了 explorer/learner/skill 分类与等级头衔；收藏馆是另一套 20 个 slug，游戏授予是第三套中文串。
4. 护眼原则要求最小 16px、暖白墨绿；欢迎页与地图仍大量使用高饱和渐变与 emoji。
5. Phase 5 报告把「可安装 / 离线 / 懒加载」标成已完成，但构建已损坏，无法验证。

## 5. 对后续重构的含义

交接方案的**产品愿景与设计约束仍然有效**：

- 分龄、护眼、国内合规、免费无广告
- 成就、每日挑战、新岛屿（数学 / 环保）是内容方向
- PWA 离线、手势、无障碍是体验方向

交接方案的**「已完成」不能当作已完成**。把脚手架误当成集成，是后续重构最容易走歪的一步。

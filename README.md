# 道闸乐园 / Barrier Buddies

面向 3–10 岁的儿童 STEM 互动乐园：以道闸为主题，把科学、工程、交通安全、语言、艺术、音乐和故事做成岛屿地图。本地运行，进度存在浏览器 `localStorage`，无广告、无账号。

## 现状

可玩的主干在 **`main`**：10 个岛屿 + 收藏馆 + 家长区。  
`origin/dev` 上有 2026-03 的交接工程方案和 Phase 1–5 脚手架，**不能直接合并**（`App.tsx` 无法构建，多数新模块未接到游戏）。

后续工作以文档为准，不以进度报告的「已完成」为准：

- [当前实现掌握](docs/current-state.md)
- [方案与代码差距](docs/gap-analysis.md)
- [重构蓝图（从 R0 徽章契约开始）](docs/refactoring-blueprint.md)
- [历史交接方案](plans/README.md)

## 本地开发

需要 Node.js 20+。

```sh
npm install
npm run dev      # http://localhost:8080
npm run test
npm run build
```

## 技术栈

Vite 5 · React 18 · TypeScript · Tailwind · React Router · 自研 `GameContext` + `localStorage`。

语音用 Web Speech API（`src/lib/speech.ts`），音效用 Web Audio 合成（`src/lib/sound.ts`）。

## 部署

GitHub Actions 将 `main` 构建并推到 Cloudflare Pages 项目 `ddyy`。工作流里的 Supabase 环境变量目前没有对应客户端代码。

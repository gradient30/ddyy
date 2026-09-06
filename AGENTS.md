# 给后续代理 / 开发者

先读 [`docs/ENGINEERING.md`](docs/ENGINEERING.md)。那是本仓库的系统说明书。下面只列动手时容易踩空的硬规则。

## 产品边界

- 学前课，不是通用玩具站。一站只学一件刚刚好的事。
- 进度在本机。不要引入登录、广告、分析 SDK、远程存档。
- 家长区密码只是防误触，不要当成安全模型去「加固」。

## 改代码顺序

1. 课程与 id：`src/data/curriculum.ts` `age.ts` `badges.ts` `vocab.ts` `progress.ts`
2. 合同测试：`src/test/contracts.test.ts` `age.test.ts` `storage.test.ts`
3. 站点页与地图：`src/pages/*` `IslandMap` `App.tsx`
4. 口播：页面字符串 + `scripts/generate-voice.py`，再提交 mp3 与 manifest

不要先写页面再补 id。`completeStation` / `addBadge` / `addKnowledge` 的字符串必须已经出现在目录里。

## 禁止

- 改 `stationId`、badge id、knowledge id 却不写存档迁移
- 只改 `speak('...')` 文案却不重录语音
- 在站点页里另写一套年龄数字，而不走 `getAgeConfig`
- 为了用 shadcn 库存组件而拆掉 `GameLayout` / `soft-card` / `kid-btn`
- 把 `src/lib/difficulty.ts` 悄悄接到某一站（先定它和年龄层谁说了算）
- 用 `npm run lint` 失败当作发布阻断——历史债未清；**测试失败必须阻断**

## 验证

```sh
npm test
npm run build
```

改 UI 时按真实儿童路径点一遍：选档案 → 选年龄 → 走一站 → 回地图看解锁 → 打开成长手册。GitHub Pages 路径要想着 `/ddyy/`。

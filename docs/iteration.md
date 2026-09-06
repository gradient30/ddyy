# 迭代手册

高质量迭代 = **小步改契约 + 门禁拦住回归**。不要先拆 God page，也不要先做新岛。

## 1. 先判断改的是哪一类

| 类型 | 典型改动 | 必碰 | 必验 |
|------|----------|------|------|
| A 课程契约 | 增删站、改解锁、改知识卡片 | `curriculum.ts` + 对应页的 `completeStation` / `addKnowledge` | `npm test`（contracts + curriculum） |
| B 年龄分层 | 某龄多一关/少一题 | 只改 `age.ts` 或该页读取 `getAgeConfig` | 萌芽/探索/建构各走一遍该站 |
| C 词汇 | 加词、改分类 | `vocab.ts` | contracts；萌芽不能看到探索词 |
| D 徽章 | 新奖、兼容旧档 | `badges.ts` aliases + 写入 slug | storage 迁移测试 |
| E 语音 | 新台词或换嗓 | `generate-voice.py` 再生 | contracts（文件存在 + 脚本同步） |
| F 玩法 UI | 关卡、SVG、按钮 | 单页 + `GameLayout` | 浏览器走通；手册数字 |
| G 存档 | 新字段 | `storage.ts` `migrateProfile` | 用旧 JSON 测 `loadGameState` |
| H 发布 | basename、404、CI | workflows + `utils.ts` | `VITE_BASE_URL=/ddyy/` 与 `/` 都能 build |

一次 PR 只主攻一类。跨类时在描述里写清，并跑完整 `npm run ci`。

## 2. 每类的落地顺序

1. **先写或改契约测试**（红），再改数据，再改页面。
2. 页面只通过 `useGame()` 写进度，禁止直接 `localStorage.setItem`。
3. 儿童文案先给耳朵听：短句、无恐吓、对了再讲「为什么」。
4. 触控目标沿用 `touch-target` / `kid-btn`，不要做成桌面密按钮。
5. 科学句必须能对照实物。杠杆、传感器、太阳能已有回归句，改 Lab 文案时不要删掉测试。

## 3. 质量门禁（本地 = CI）

```sh
npm install          # 或 npm ci
npm run typecheck
npm test
npm run lint
VITE_BASE_URL=/ddyy/ npm run build
VITE_BASE_URL=/ npm run build
```

`npm run ci` 会按这个顺序跑（构建两次 base）。

PR 模板会问：年龄层、站点 id、语音是否新台词、旧存档是否仍能打开。答不上来就还没掌握这次改动。

## 4. 回归清单（改玩法时）

- [ ] 未选年龄不能进小路
- [ ] 萌芽进地图，第二站锁定
- [ ] 完成当前站后下一站打开
- [ ] 家长「开放全部站点」后可点进世界花园
- [ ] 关语音后页面不再出声
- [ ] 成长手册的站 / 本领 / 徽章与刚才玩到的一致
- [ ] GitHub Pages 深链（`/ddyy/math`）不会停在 404 页

## 5. 明确不做（除非产品改方向）

- 合并 `origin/dev` 当「重构完成」
- 新开第 10 站或海外内容堆砌
- 自适应难度（`difficulty.ts`）在年龄层稳定之前
- 账号、云存档、分析 SDK
- 把 God page 拆文件但行为漂移

拆页可以做，但必须先有该站的完成契约测试，拆完行为不变。

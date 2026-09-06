# 道闸成长小路

给 **4–7 岁** 的学前互动课：以道闸为主题，把观察、数感、语言、安全和科学排成一条成长小路。免费、无广告、进度存在本机。

## 怎么玩

1. 选小朋友，再选年龄：**萌芽 4–5 / 探索 5–6 / 建构 6–7**
2. 从欢迎小屋出发，按序打开下一站
3. 每站只学一件刚刚好的事；学会的本领收进成长手册

家长区密码默认 `1234`。可以关掉声音/语音，或开放全部站点。

## 本地开发

```sh
npm install
npm run dev
npm run ci
```

`npm run ci` 会跑类型检查、测试、lint，以及 `/ddyy/` 与 `/` 两套构建（对应 GitHub Pages 与 Cloudflare）。

开发服务器默认 `http://localhost:8080`。

## 工程入口

后续迭代从这些文件开始，不要沿用已作废的 [PR #1](https://github.com/gradient30/ddyy/pull/1) 交接稿：

| 文件 | 用途 |
|------|------|
| [AGENTS.md](./AGENTS.md) | 产品、契约、禁区、语音与发布 |
| [docs/architecture.md](./docs/architecture.md) | 当前运行时与数据模型 |
| [docs/iteration.md](./docs/iteration.md) | 按改动类型怎么改、怎么验 |

课程真值在 `src/data/curriculum.ts`。对照《3–6 岁儿童学习与发展指南》五大领域，并补上 4–7 岁数感分层。

## 发布

- GitHub Pages：`/ddyy/`（`VITE_BASE_URL=/ddyy/`）
- Cloudflare Pages：根路径

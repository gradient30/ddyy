# 道闸成长小路

给 **4–7 岁** 的学前互动课：以道闸为主题，把观察、数感、语言、安全和科学排成一条成长小路。免费、无广告、进度存在本机。

系统结构、通关契约、年龄分层、语音管线和发布门禁见 **[docs/ENGINEERING.md](docs/ENGINEERING.md)**。后续迭代先读那一份。

## 怎么玩

1. 选小朋友，再选年龄：**萌芽 4–5 / 探索 5–6 / 建构 6–7**
2. 从欢迎小屋出发，按序打开下一站
3. 每站只学一件刚刚好的事；学会的本领收进成长手册

家长区密码默认 `1234`。可以关掉声音/语音，或开放全部站点。

## 本地开发

```sh
npm install
npm run dev
npm test
npm run build
```

`main` 与 Pull Request 会跑 `.github/workflows/quality.yml`（测试 + 构建）。发布到 GitHub Pages / Cloudflare 前也会先跑测试。

## 课程依据

对照《3–6 岁儿童学习与发展指南》五大领域，并补上 4–7 岁关键的数感分层。站点表在 `src/data/curriculum.ts`，通关可颁发的徽章/本领在 `src/data/progress.ts`。

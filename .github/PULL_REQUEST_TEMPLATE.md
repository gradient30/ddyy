## 改了什么

- 类型（可多选）：A 课程契约 / B 年龄分层 / C 词汇 / D 徽章 / E 语音 / F 玩法 UI / G 存档 / H 发布
- 孩子会看到或听到的变化：

## 契约

- [ ] 未新增来路不明的 `completeStation` / `addBadge` / `addKnowledge` id
- [ ] 若改了站点、年龄、词汇、徽章，已更新 `src/data/*` 而不是只改页面
- [ ] 若有新 `speak()` 原文，已写入 `scripts/generate-voice.py` 并生成 mp3
- [ ] 旧档 `barrier-buddies-data` 仍能打开（只加字段）

## 门禁

- [ ] `npm run ci` 通过
- [ ] 若改了儿童页：萌芽路径下点过该站，成长手册数字对得上

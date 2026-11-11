# dsh-inspiration-vault · 灵感库

给 DSH 加一个本地灵感库。

白天看到个东西——竞品、值得抄的账号、一个市场直觉——打一行字，存下来。过几天想起「我好像记过」，三个关键词就翻出来。

就这一件事。

```text
/idea 看到有人在小红书卖 Excel 模板，一个月卖了两万多
→ 已记下 · i-20261111-001 · 灵感
  「看到有人在小红书卖 Excel 模板，一个月卖了两万多」
  标签：小红书

/ideas 模板
→ 搜到 1 条（模板）：
  1. 看到有人在小红书卖 Excel 模板，一个月卖了两万多
     灵感 · i-20261111-001
```

## 为什么再造一个

大部分「AI 笔记」都在回答你没问的问题：替你总结、替你打分、替你安排下一步，顺手把一句随口一说变成一条你从没答应过的待办。

这个不做这些。

- **只记录，不评价。** 没有结论、没有「价值分析」、没有未经请求的建议。想听判断，你自己开口。
- **绝不生成待办。** 笔记就是笔记。`next` 默认空着，要不要填是你的事。
- **纯文件。** 一条笔记一个 markdown 文件，放在 `~/.dsh/inspiration-vault/cards/`。能读、能 grep、能改、能 git。没有数据库，没有导出按钮，没有锁定。
- **零依赖。** 不装任何 npm 包，不联网，不要 API key。
- **离线。** 一个字都不离开你的机器。

## 安装

DSH 应用里：设置 → 插件 → 搜索 `dsh-inspiration-vault` 安装。

或者从源码装：

```bash
git clone https://github.com/clair0314/dsh-inspiration-vault.git
cd dsh-inspiration-vault
dsh plugin install .
```

## 命令

| 命令 | 作用 |
| --- | --- |
| `/idea <内容>` | 记一条。可以带链接、可以多行。 |
| `/idea --opportunity <内容>` | 同上，但指定类型（`idea` · `opportunity` · `observation` · `reference` · `todo`）。 |
| `/ideas` | 最近 8 条。 |
| `/ideas <关键词>` | 加权检索：标题 ×6、标签 ×5、正文 ×2，中英文都能搜。 |
| `/ideas <编号>` | 看某一条全文，`006` 就够，不用打全日期。 |

## 卡片长这样

```yaml
---
id: i-20261111-001
title: 看到有人在小红书卖 Excel 模板，一个月卖了两万多
type: idea            # idea | opportunity | observation | reference | todo
status: seed          # seed | exploring | doing | done | dropped | archived
tags: [小红书, 模板, 变现]
next:                 # 故意留空——你决定要做了再填
source: https://www.xiaohongshu.com/...
created: 2026-11-11T14:02:11+08:00
updated: 2026-11-11T14:02:11+08:00
---
看到有人在小红书卖 Excel 模板，一个月卖了两万多，链接：https://...
```

frontmatter 下面的内容是你的原文，一个字都不动。

## 配置

默认存 `~/.dsh/inspiration-vault`。想换目录（比如放到同步盘），在插件配置里写：

```yaml
vaultDir: ~/Dropbox/inspiration
```

或者启动 DSH 前 `export DSH_INSPIRATION_DIR=...`。

## 可选：让助手会翻这个库

`skill/SKILL.md` 是一份现成的技能说明，告诉 agent 什么时候该先查这个库（营销方案、选题、增长玩法、「我之前是不是记过」）。装进技能目录：

```bash
mkdir -p ~/.agents/skills/inspiration-vault
cp skill/SKILL.md ~/.agents/skills/inspiration-vault/SKILL.md
```

## 后面可能加

- [ ] `/ideas due` —— 只列你自己标了日期的
- [ ] 标签索引页
- [ ] 可选的每日回顾（只汇总，不评价）

明确不做：自动评分、自动待办、你没问就来的「AI 建议」。

## 许可

MIT © clairliu

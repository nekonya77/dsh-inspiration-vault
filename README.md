# dsh-inspiration-vault

A local idea vault for [DSH](https://deepseek-harness.com).

You see something during the day — a competitor's product, an account worth copying, a hunch about a market. You type one line. It's stored. Later you type three keywords and it's back.

That's the whole thing.

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

## Why this one

Most "AI note apps" answer a question you didn't ask: they summarise your note, rate it, tell you what to do next, and quietly turn a passing thought into a todo item you never agreed to.

This one doesn't.

- **Records, doesn't judge.** No verdict, no "significance", no unsolicited advice. If you want an opinion, ask for one.
- **Never creates todos.** A note is a note. `next` stays empty unless you type it yourself.
- **Plain files.** One markdown card per note in `~/.dsh/inspiration-vault/cards/`. Readable, greppable, editable, `git`-able. No database, no export button, no lock-in.
- **Zero dependencies.** No npm packages, no network calls, no API keys.
- **Works offline.** Nothing leaves your machine.

## Install

From the DSH app: Settings → Plugins → install `dsh-inspiration-vault`.

Or from source:

```bash
git clone https://github.com/clair0314/dsh-inspiration-vault.git
cd dsh-inspiration-vault
dsh plugin install .
```

## Commands

| Command | What it does |
| --- | --- |
| `/idea <text>` | Store one note. Accepts a URL, multiple lines, anything. |
| `/idea --opportunity <text>` | Same, but pin the type (`idea` · `opportunity` · `observation` · `reference` · `todo`). |
| `/ideas` | The 8 most recent notes. |
| `/ideas <keyword>` | Weighted search: title ×6, tags ×5, body ×2. Chinese and English both work. |
| `/ideas <id>` | Full text of one card. `006` is enough — no need to type the date. |

## Card format

```yaml
---
id: i-20261111-001
title: 看到有人在小红书卖 Excel 模板，一个月卖了两万多
type: idea            # idea | opportunity | observation | reference | todo
status: seed          # seed | exploring | doing | done | dropped | archived
tags: [小红书, 模板, 变现]
next:                 # empty by design — you fill this only if you decide to act
source: https://www.xiaohongshu.com/...
created: 2026-11-11T14:02:11+08:00
updated: 2026-11-11T14:02:11+08:00
---
看到有人在小红书卖 Excel 模板，一个月卖了两万多，链接：https://...
```

Everything after the frontmatter is your own text, untouched.

## Configuration

Defaults to `~/.dsh/inspiration-vault`. To use another directory (e.g. a synced folder), set it in the plugin config:

```yaml
vaultDir: ~/Dropbox/inspiration
```

or export `DSH_INSPIRATION_DIR` before starting DSH.

## Optional: let the assistant read the vault

`skill/SKILL.md` is a ready-made skill that tells an agent *when* to search this vault before answering (marketing plans, content pitches, growth ideas, "didn't I write something about this?"). Copy it in:

```bash
mkdir -p ~/.agents/skills/inspiration-vault
cp skill/SKILL.md ~/.agents/skills/inspiration-vault/SKILL.md
```

## Roadmap

- [ ] `/ideas due` — only cards where you set a date yourself
- [ ] tag index page
- [ ] daily recap you can schedule (opt-in, summary only)

Deliberately not on the roadmap: auto-scoring, auto-todos, "AI suggestions" you didn't ask for.

## License

MIT © clairliu

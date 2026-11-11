// 卡片存储：一个目录、一张 md、frontmatter 存字段。
// 故意不引第三方依赖 —— 装上就能跑，卡片是纯文本，坏了也能手改。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseFrontmatter, stringifyFrontmatter } from './frontmatter.js';

export const TYPES = {
  idea: '灵感',
  opportunity: '机会',
  todo: '待办',
  observation: '观察',
  reference: '参考',
};

export function vaultDirOf(config = {}) {
  const raw = config.vaultDir || process.env.DSH_INSPIRATION_DIR || path.join(os.homedir(), '.dsh', 'inspiration-vault');
  const dir = path.resolve(String(raw));
  fs.mkdirSync(path.join(dir, 'cards'), { recursive: true });
  return dir;
}

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const stamp = (d = new Date()) => `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const compact = (d = new Date()) => ymd(d).replace(/-/g, '');

export function slugify(s, max = 24) {
  const clean = String(s || '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\\/:*?"<>|#\n\r\t]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (clean.slice(0, max) || 'untitled').replace(/-+$/, '');
}

function cardDir(dir) {
  return path.join(dir, 'cards');
}

export function listCards(dir) {
  const files = fs.existsSync(cardDir(dir)) ? fs.readdirSync(cardDir(dir)).filter((f) => f.endsWith('.md')) : [];
  const out = [];
  for (const f of files) {
    const file = path.join(cardDir(dir), f);
    try {
      const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      if (!data.id) continue;
      out.push({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [String(data.tags)] : [],
        body: String(body || '').trim(),
        file,
      });
    } catch { /* 跳过坏文件，不让一张卡毁掉整个库 */ }
  }
  return out.sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
}

export function findCard(dir, idOrPrefix) {
  const key = String(idOrPrefix || '').trim();
  if (!key) return null;
  const cards = listCards(dir);
  return cards.find((c) => c.id === key)
    || cards.find((c) => String(c.id).startsWith(key))
    || cards.find((c) => String(c.id).endsWith(key.replace(/^i-?/i, '')));
}

function nextId(dir, now = new Date()) {
  const day = compact(now);
  let max = 0;
  for (const c of listCards(dir)) {
    const m = String(c.id).match(/^i-(\d{8})-(\d{3})$/);
    if (m && m[1] === day) max = Math.max(max, Number(m[2]));
  }
  return `i-${day}-${String(max + 1).padStart(3, '0')}`;
}

const RULES = [
  [/todo|待办|提醒我|记得/, 'todo'],
  [/机会|能卖|赚钱|变现|市场|需求/, 'opportunity'],
  [/https?:\/\//, 'reference'],
  [/发现|注意到|观察到|感觉|好像/, 'observation'],
];

export function guessType(text, explicit) {
  if (explicit && TYPES[explicit]) return explicit;
  for (const [re, t] of RULES) if (re.test(text)) return t;
  return 'idea';
}

/** 只记录：正文原样保留，标题取第一行，类型靠关键词兜底。 */
export function createCard(dir, text, { type, tags = [], source = '', title } = {}) {
  const body = String(text || '').trim();
  if (!body) throw new Error('内容是空的');
  const now = new Date();
  const firstLine = body.split('\n').map((l) => l.trim()).find(Boolean) || '未命名';
  const titleText = firstLine.replace(/https?:\/\/\S+/g, '').trim() || (body.match(/https?:\/\/\S+/) || ['链接'])[0];
  const link = (body.match(/https?:\/\/\S+/) || [''])[0];
  const card = {
    id: nextId(dir, now),
    title: (title || titleText).slice(0, 40),
    type: guessType(body, type),
    status: 'seed',
    tags: tags.length ? tags : autoTags(body),
    score: 0,
    effort: '',
    next: '',
    due: '',
    source: source || link,
    created: `${stamp(now)}+08:00`,
    updated: `${stamp(now)}+08:00`,
    reviewed: false,
  };
  const file = path.join(cardDir(dir), `${card.id}-${slugify(card.title)}.md`);
  fs.writeFileSync(file, stringifyFrontmatter(card, body), 'utf8');
  return { ...card, body, file };
}

/** 关键词兜底打标：不猜内容，只挑文本里真出现过的东西。 */
export function autoTags(text) {
  const dict = ['B站', '小红书', '抖音', '公众号', '视频号', '知乎', 'YouTube', '飞书', '微信',
    'AI', 'Agent', '自动化', '变现', '选题', '拆解', '对标', '增长', '私域', 'SaaS', '出海', '插件', '工作流'];
  const low = String(text).toLowerCase();
  return dict.filter((k) => {
    const needle = k.toLowerCase();
    // 短英文标签按词边界匹配，避免 "SOP" 里的 X 之类误伤
    if (/^[a-z]{1,3}$/.test(needle)) return new RegExp(`(^|[^a-z])${needle}([^a-z]|$)`).test(low);
    return low.includes(needle);
  }).slice(0, 5);
}

const latin = (q) => (q.match(/[a-z0-9][a-z0-9+#._-]*/gi) || []).filter((s) => s.length > 1);
const cjkRuns = (q) => q.match(/[\u4e00-\u9fa5]+/g) || [];

export function terms(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const compactQ = q.replace(/[\s\-_/]+/g, '');
  const out = new Set();
  for (const w of latin(q)) out.add(w.toLowerCase());
  for (const run of cjkRuns(q)) {
    if (run.length === 1 && compactQ.length === 1) out.add(run);
    else if (run.length === 2) out.add(run);
    else if (run.length > 2) for (let i = 0; i < run.length - 1; i++) out.add(run.slice(i, i + 2));
  }
  if (/[\u4e00-\u9fa5]/.test(compactQ) && /[a-z0-9]/.test(compactQ)) {
    for (let i = 0; i < compactQ.length - 1; i++) out.add(compactQ.slice(i, i + 2));
  }
  return [...out].filter(Boolean);
}

/** 加权检索：标题 > 标签 > 正文。空查询返回全部。 */
export function searchCards(dir, query, { limit = 10, type, status } = {}) {
  let cards = listCards(dir);
  if (type) cards = cards.filter((c) => c.type === type);
  if (status) cards = cards.filter((c) => c.status === status);
  const ts = terms(query);
  if (!ts.length) return cards.slice(0, limit);
  const scored = cards.map((c) => {
    const title = String(c.title || '').toLowerCase();
    const tags = c.tags.join(' ').toLowerCase();
    const body = String(c.body || '').toLowerCase();
    let score = 0;
    for (const t of ts) {
      if (title.includes(t)) score += 6;
      if (tags.includes(t)) score += 5;
      if (body.includes(t)) score += 2;
    }
    return { ...c, _score: score };
  }).filter((c) => c._score > 0);
  scored.sort((a, b) => b._score - a._score || String(b.created).localeCompare(String(a.created)));
  return scored.slice(0, limit);
}

export function stats(dir) {
  const cards = listCards(dir);
  const by = (k) => cards.reduce((acc, c) => ({ ...acc, [c[k]]: (acc[c[k]] || 0) + 1 }), {});
  return { total: cards.length, byType: by('type'), byStatus: by('status') };
}

export function renderCard(card) {
  const head = `${card.id} · ${TYPES[card.type] || card.type}`;
  const tags = card.tags?.length ? `　标签：${card.tags.join(' / ')}` : '';
  const body = card.body ? `\n${card.body.split('\n').slice(0, 6).join('\n')}` : '';
  return `${head}　「${card.title}」${tags}${body}`;
}

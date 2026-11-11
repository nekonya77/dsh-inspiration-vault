// 极简 YAML frontmatter 读写：只覆盖卡片用到的标量、行内数组、布尔和数字。
const isNum = (v) => /^-?\d+(\.\d+)?$/.test(v);

function coerce(raw) {
  const v = raw.trim();
  if (!v) return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (isNum(v)) return Number(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((s) => coerce(s));
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

export function parseFrontmatter(text) {
  const m = String(text || '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: String(text || '') };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 0) continue;
    data[line.slice(0, i).trim()] = coerce(line.slice(i + 1));
  }
  return { data, body: String(text || '').slice(m[0].length) };
}

const needQuote = /[:#\[\]{}"'']|^\s|\s$/;

export function stringifyFrontmatter(data, body = '') {
  const lines = ['---'];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) lines.push(`${k}: [${v.map((x) => String(x)).join(', ')}]`);
    else if (v === '' || v === null) lines.push(`${k}:`);
    else if (typeof v === 'string' && needQuote.test(v)) lines.push(`${k}: "${v.replace(/"/g, '\\"')}"`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---', '');
  return `${lines.join('\n')}\n${String(body || '').trim()}\n`;
}

// dsh-inspiration-vault —— 给 DSH 加一个「灵感库」：
//   记录：/idea 一句话 → 存成一张 markdown 卡片（只记录，不评价、不派活）
//   翻找：/ideas 关键词 → 加权检索；/ideas 006 → 看某一条的全文
// 卡片是纯文本，落在 ~/.dsh/inspiration-vault/cards/，可以直接用编辑器改、用 git 备份。
import { vaultDirOf, createCard, listCards, findCard, searchCards, stats, renderCard, TYPES } from './store.js';

export const name = 'inspiration-vault';
export const inject = ['commands'];

const TYPE_LABEL = TYPES;

function receipt(card) {
  const lines = [`已记下 · ${card.id} · ${TYPE_LABEL[card.type] || card.type}`];
  lines.push(`「${card.title}」`);
  if (card.tags?.length) lines.push(`标签：${card.tags.join(' / ')}`);
  return lines.join('\n');
}

function detail(card) {
  const meta = [
    `${card.id} · ${TYPE_LABEL[card.type] || card.type} · ${card.status}`,
    card.tags?.length ? `标签：${card.tags.join(' / ')}` : '',
    card.source ? `来源：${card.source}` : '',
    card.created ? `记于：${String(card.created).slice(0, 16).replace('T', ' ')}` : '',
  ].filter(Boolean);
  return [`「${card.title}」`, ...meta, '', card.body || ''].join('\n').trim();
}

export function apply(ctx, config = {}) {
  const dir = vaultDirOf(config);

  ctx.effect(
    () =>
      ctx.commands.register({
        name: 'idea',
        description: '记一条灵感/机会/观察（只记录，不评价，不生成待办）',
        input: { hint: '一句话，可以带链接；加 --todo 只在你自己说要待办时用' },
        handler: ({ rawInput }) => {
          let text = String(rawInput || '').trim();
          if (!text) return { kind: 'error', text: '写一句话再发。' };
          let type;
          const m = text.match(/^--(idea|opportunity|observation|reference|todo)\s+/);
          if (m) { type = m[1]; text = text.slice(m[0].length); }
          try {
            const card = createCard(dir, text, { type });
            return { kind: 'success', text: receipt(card) };
          } catch (e) {
            return { kind: 'error', text: `没记上：${e?.message || e}` };
          }
        },
      }),
    'inspiration-vault: /idea',
  );

  ctx.effect(
    () =>
      ctx.commands.register({
        name: 'ideas',
        description: '翻灵感库：不带参数=最近的；带关键词=检索；带编号=看全文',
        input: { hint: '[关键词 | 编号]' },
        handler: ({ rawInput }) => {
          const q = String(rawInput || '').trim();
          if (!q) {
            const all = listCards(dir);
            const s = stats(dir);
            if (!all.length) return { kind: 'success', text: '库里还是空的。用 /idea 记第一条。' };
            const lines = [`灵感库 · ${s.total} 条`, ''];
            all.slice(0, 8).forEach((c) => lines.push(`· ${TYPE_LABEL[c.type] || c.type} ${c.title}　${c.id}`));
            if (all.length > 8) lines.push('', `还有 ${all.length - 8} 条，用 /ideas 关键词 找。`);
            return { kind: 'success', text: lines.join('\n') };
          }
          const byId = findCard(dir, q);
          if (byId) return { kind: 'success', text: detail(byId) };
          const hits = searchCards(dir, q, { limit: 8 });
          if (!hits.length) return { kind: 'success', text: `库里没有跟「${q}」相关的记录。` };
          const lines = [`搜到 ${hits.length} 条（${q}）：`, ''];
          hits.forEach((c, i) => lines.push(`${i + 1}. ${c.title}`, `   ${TYPE_LABEL[c.type] || c.type} · ${c.id}`));
          return { kind: 'success', text: lines.join('\n') };
        },
      }),
    'inspiration-vault: /ideas',
  );
}

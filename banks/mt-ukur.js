window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-ukur",
  subject: "数学",
  title: "度量衡",
  questions: [
    { type: "choice", stem: "哪一支比较长？", visual: { k: "cmp", items: [{ e: "✏️", len: 3 }, { e: "✏️", len: 5 }] }, opts: ["第一支", "第二支"], ans: 1, ref: "度量衡", why: "第二支有 5 格，比 3 格长" },
    { type: "choice", stem: "哪一支比较短？", visual: { k: "cmp", items: [{ e: "✏️", len: 2 }, { e: "✏️", len: 6 }] }, opts: ["第一支", "第二支"], ans: 0, ref: "度量衡", why: "第一支只有 2 格，比较短" },
    { type: "num", stem: "铅笔比蜡笔长几格？", visual: { k: "cmp", items: [{ e: "✏️", len: 6 }, { e: "🖍️", len: 4 }] }, ans: 2, ref: "度量衡", why: "6 − 4 = 2" },
    { type: "choice", stem: "哪一个比较重？", visual: { k: "weigh", left: "🍎", right: "🍉", heavier: "right" }, opts: ["苹果", "西瓜", "一样重"], ans: 1, ref: "度量衡", why: "天平往西瓜那边沉" },
    { type: "choice", stem: "哪一个比较重？", visual: { k: "weigh", left: "🍎", right: "🍌", heavier: "left" }, opts: ["一样重", "香蕉", "苹果"], ans: 2, ref: "度量衡", why: "天平往苹果那边沉" },
    { type: "choice", stem: "哪一杯水最多？", visual: { k: "cup", levels: [3, 5, 2] }, opts: ["第一杯", "第二杯", "第三杯"], ans: 1, ref: "度量衡", why: "水位最高的水最多" },
    { type: "num", stem: "第二杯比第一杯多几格水？", visual: { k: "cup", levels: [2, 5] }, ans: 3, ref: "度量衡", why: "5 − 2 = 3" },
    { type: "num", stem: "桌子长 7 个手掌，书长 3 个，桌子长多几个？", ans: 4, ref: "度量衡", why: "7 − 3 = 4" },
    { type: "num", stem: "1 个苹果重 2 颗草莓，3 个苹果重几颗？", ans: 6, ref: "度量衡", why: "2 + 2 + 2 = 6" },
    { type: "num", stem: "铅笔长 4 个回形针，两支共几个回形针？", ans: 8, ref: "度量衡", why: "4 + 4 = 8" }
  ]
});

window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-pecahan",
  subject: "数学",
  title: "分数",
  questions: [
    { type: "num", stem: "这个圆一共分成几等份？", visual: { k: "frac", shape: "circle", parts: 4, shade: 1 }, ans: 4, ref: "分数", why: "数一数一共有几份" },
    { type: "num", stem: "长方形涂色的有几份？", visual: { k: "frac", shape: "rect", parts: 2, shade: 1 }, ans: 1, ref: "分数", why: "数涂了颜色的格子" },
    { type: "num", stem: "圆涂色的有几份？", visual: { k: "frac", shape: "circle", parts: 4, shade: 3 }, ans: 3, ref: "分数", why: "数涂了颜色的份数" },
    { type: "choice", stem: "哪一个涂了 1/2？", opts: [
      { t: "甲", visual: { k: "frac", shape: "rect", parts: 4, shade: 1 } },
      { t: "乙", visual: { k: "frac", shape: "rect", parts: 2, shade: 1 } },
      { t: "丙", visual: { k: "frac", shape: "rect", parts: 4, shade: 3 } }
    ], ans: 1, ref: "分数", why: "分成 2 份，涂 1 份" },
    { type: "choice", stem: "哪一个涂了 1/4？", opts: [
      { t: "甲", visual: { k: "frac", shape: "circle", parts: 4, shade: 1 } },
      { t: "乙", visual: { k: "frac", shape: "circle", parts: 2, shade: 1 } },
      { t: "丙", visual: { k: "frac", shape: "circle", parts: 4, shade: 3 } }
    ], ans: 0, ref: "分数", why: "分成 4 份，涂 1 份" },
    { type: "choice", stem: "涂色的部分是几分之几？", visual: { k: "frac", shape: "circle", parts: 4, shade: 3 }, opts: ["1/4", "2/4", "3/4"], ans: 2, ref: "分数", why: "分成 4 份，涂了 3 份" },
    { type: "choice", stem: "涂色的部分是几分之几？", visual: { k: "frac", shape: "rect", parts: 4, shade: 2 }, opts: ["1/4", "2/4", "3/4"], ans: 1, ref: "分数", why: "分成 4 份，涂了 2 份" },
    { type: "num", stem: "饼分成 4 份，涂色的已吃，还剩几份？", visual: { k: "frac", shape: "circle", parts: 4, shade: 1 }, ans: 3, ref: "分数", why: "4 份减去吃掉的 1 份" },
    { type: "num", stem: "涂了 2 份，一共分成几份？", visual: { k: "frac", shape: "rect", parts: 4, shade: 2 }, ans: 4, ref: "分数", why: "数一数全部的格子" },
    { type: "choice", stem: "哪一个涂色的最多？", opts: [
      { t: "甲", visual: { k: "frac", shape: "circle", parts: 4, shade: 3 } },
      { t: "乙", visual: { k: "frac", shape: "circle", parts: 4, shade: 1 } },
      { t: "丙", visual: { k: "frac", shape: "circle", parts: 2, shade: 1 } }
    ], ans: 0, ref: "分数", why: "3/4 比 1/2 和 1/4 都多" }
  ]
});

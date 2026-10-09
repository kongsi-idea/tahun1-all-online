window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-campur",
  subject: "数学",
  title: "综合热身",
  questions: [
    { type: "num", stem: "算一算", visual: { k: "text", t: "8 + 7 = ?" }, ans: 15, ref: "基本运算", why: "8 + 2 = 10，再加 5" },
    { type: "num", stem: "算一算", visual: { k: "text", t: "16 − 9 = ?" }, ans: 7, ref: "基本运算", why: "16 − 6 = 10，再减 3" },
    { type: "choice", stem: "涂色的部分是几分之几？", visual: { k: "frac", shape: "circle", parts: 2, shade: 1 }, opts: ["3/4", "1/4", "1/2"], ans: 2, ref: "分数", why: "分成 2 份，涂 1 份" },
    { type: "num", stem: "一共有几仙？", visual: { k: "money", items: [{ k: "coin", v: 20 }, { k: "coin", v: 20 }, { k: "coin", v: 5 }] }, ans: 45, ref: "钱币", why: "20 + 20 + 5 = 45" },
    { type: "num", stem: "算一算", visual: { k: "text", t: "12 + 6 = ?" }, ans: 18, ref: "基本运算", why: "2 + 6 = 8，加上 10" },
    { type: "choice", stem: "现在是什么时刻？", visual: { k: "clock", h: 7, m: 30 }, opts: ["7时", "7时半", "8时"], ans: 1, ref: "时间与时刻", why: "长针指着 6，是 7 时半" },
    { type: "num", stem: "第一杯比第二杯多几格水？", visual: { k: "cup", levels: [4, 1] }, ans: 3, ref: "度量衡", why: "4 − 1 = 3" },
    { type: "choice", stem: "这是什么立体图形？", visual: { k: "solid", s: "cone" }, opts: ["圆锥体", "球体", "圆柱体"], ans: 0, ref: "空间", why: "底是圆，上面尖尖" },
    { type: "num", stem: "狗比猫多几只？", visual: { k: "emoji2", rows: [["🐱", 3], ["🐶", 5]] }, ans: 2, ref: "数据处理", why: "5 − 3 = 2" },
    { type: "num", stem: "算一算", visual: { k: "text", t: "19 − 8 = ?" }, ans: 11, ref: "基本运算", why: "19 减 8，个位 9 − 8 = 1" }
  ]
});

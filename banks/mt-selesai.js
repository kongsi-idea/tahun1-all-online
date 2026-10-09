window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-selesai",
  subject: "数学",
  title: "解决问题",
  questions: [
    { type: "num", stem: "饼分成 4 份，吃了 1 份，剩几份？", visual: { k: "frac", shape: "circle", parts: 4, shade: 1 }, ans: 3, ref: "解决问题", why: "4 − 1 = 3" },
    { type: "choice", stem: "蛋糕分成 4 份，吃了 3 份，是几分之几？", opts: ["1/4", "3/4", "1/2"], ans: 1, ref: "解决问题", why: "分成 4 份，吃了 3 份" },
    { type: "num", stem: "买糖 30 仙，买笔 50 仙，共几仙？", ans: 80, ref: "解决问题", why: "30 + 50 = 80" },
    { type: "num", stem: "有 RM9，买书用了 RM4，还剩几令吉？", ans: 5, ref: "解决问题", why: "9 − 4 = 5" },
    { type: "num", stem: "我有 40 仙，买橡皮擦 25 仙，剩几仙？", ans: 15, ref: "解决问题", why: "40 − 25 = 15" },
    { type: "choice", stem: "铅笔 5 格，尺 8 格，哪个比较短？", opts: ["铅笔", "尺", "一样长"], ans: 0, ref: "解决问题", why: "5 比 8 小，铅笔较短" },
    { type: "num", stem: "桌子长 9 个手掌，椅子长 4 个，差几个？", ans: 5, ref: "解决问题", why: "9 − 4 = 5" },
    { type: "choice", stem: "哪个形状最像篮球？", opts: ["正方体", "圆锥体", "球体"], ans: 2, ref: "解决问题", why: "篮球圆圆的，是球体" },
    { type: "num", stem: "苹果和香蕉一共有几个？", visual: { k: "emoji2", rows: [["🍎", 6], ["🍌", 4]] }, ans: 10, ref: "解决问题", why: "6 + 4 = 10" },
    { type: "num", stem: "单车比汽车多几辆？", visual: { k: "emoji2", rows: [["🚗", 5], ["🚲", 8]] }, ans: 3, ref: "解决问题", why: "8 − 5 = 3" }
  ]
});

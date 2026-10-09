window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-wang",
  subject: "数学",
  title: "钱币",
  questions: [
    { type: "choice", stem: "这是几仙的硬币？", visual: { k: "coin", v: 50 }, opts: ["20仙", "50仙", "10仙"], ans: 1, ref: "钱币", why: "硬币上写着 50 仙" },
    { type: "choice", stem: "这是多少令吉的纸币？", visual: { k: "note", v: 5 }, opts: ["RM1", "RM10", "RM5"], ans: 2, ref: "钱币", why: "纸币上的数字是 5" },
    { type: "num", stem: "一共有几仙？", visual: { k: "money", items: [{ k: "coin", v: 20 }, { k: "coin", v: 20 }, { k: "coin", v: 10 }] }, ans: 50, ref: "钱币", why: "20 + 20 + 10 = 50" },
    { type: "num", stem: "一共有几仙？", visual: { k: "money", items: [{ k: "coin", v: 50 }, { k: "coin", v: 20 }, { k: "coin", v: 10 }] }, ans: 80, ref: "钱币", why: "50 + 20 + 10 = 80" },
    { type: "num", stem: "1 张 RM5 换成 RM1 纸币，要几张？", visual: { k: "note", v: 5 }, ans: 5, ref: "钱币", why: "5 个 RM1 就是 RM5" },
    { type: "num", stem: "1 张 RM10 换成 RM5 纸币，要几张？", visual: { k: "note", v: 10 }, ans: 2, ref: "钱币", why: "5 + 5 = 10" },
    { type: "num", stem: "买糖 10 仙，买饼 20 仙，共几仙？", ans: 30, ref: "钱币", why: "10 + 20 = 30" },
    { type: "num", stem: "有 50 仙，买 30 仙的糖，还剩几仙？", ans: 20, ref: "钱币", why: "50 − 30 = 20" },
    { type: "num", stem: "书 RM3，笔 RM4，一共几令吉？", ans: 7, ref: "钱币", why: "3 + 4 = 7" },
    { type: "choice", stem: "哪一个钱最多？", opts: ["RM1", "50仙", "20仙"], ans: 0, ref: "钱币", why: "RM1 就是 100 仙" }
  ]
});

window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-masa",
  subject: "数学",
  title: "时刻",
  questions: [
    { type: "num", stem: "现在是几时？", visual: { k: "clock", h: 3, m: 0 }, ans: 3, ref: "时间与时刻", why: "短针指着 3，长针指着 12" },
    { type: "num", stem: "现在是几时？", visual: { k: "clock", h: 8, m: 0 }, ans: 8, ref: "时间与时刻", why: "长针指 12，短针指着 8" },
    { type: "choice", stem: "现在是什么时刻？", visual: { k: "clock", h: 5, m: 30 }, opts: ["5时半", "5时", "6时"], ans: 0, ref: "时间与时刻", why: "长针指着 6，是 5 时半" },
    { type: "choice", stem: "现在是什么时刻？", visual: { k: "clock", h: 12, m: 0 }, opts: ["12时", "6时", "3时"], ans: 0, ref: "时间与时刻", why: "长针和短针都指着 12" },
    { type: "num", stem: "半小时是几分钟？", ans: 30, ref: "时间与时刻", why: "一小时 60 分钟，一半是 30" },
    { type: "choice", stem: "星期三的后一天是星期几？", opts: ["星期二", "星期四", "星期五"], ans: 1, ref: "时间与时刻", why: "星期三之后是星期四" },
    { type: "choice", stem: "星期日的后一天是星期几？", opts: ["星期六", "星期日", "星期一"], ans: 2, ref: "时间与时刻", why: "星期日过后又是星期一" },
    { type: "num", stem: "一个星期有几天？", ans: 7, ref: "时间与时刻", why: "星期一到星期日共 7 天" },
    { type: "choice", stem: "晚上最后要做什么？", opts: ["吃早餐", "上学", "睡觉"], ans: 2, ref: "时间与时刻", why: "晚上要睡觉休息" },
    { type: "choice", stem: "现在是什么时刻？", visual: { k: "clock", h: 9, m: 30 }, opts: ["9时", "10时", "9时半"], ans: 2, ref: "时间与时刻", why: "长针指着 6，短针在 9 和 10 中间" }
  ]
});

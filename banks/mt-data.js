window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-data",
  subject: "数学",
  title: "数据处理",
  questions: [
    { type: "choice", stem: "最多的是哪一个？", visual: { k: "emoji2", rows: [["🍎", 5], ["🍌", 3], ["🍊", 2]] }, opts: ["苹果", "香蕉", "橙子"], ans: 0, ref: "数据处理", why: "苹果那一行最长" },
    { type: "choice", stem: "最少的是哪一个？", visual: { k: "emoji2", rows: [["🍎", 3], ["🍌", 6], ["🍊", 4]] }, opts: ["香蕉", "橙子", "苹果"], ans: 2, ref: "数据处理", why: "苹果只有 3 个，最短" },
    { type: "num", stem: "苹果比香蕉多几个？", visual: { k: "emoji2", rows: [["🍎", 5], ["🍌", 3]] }, ans: 2, ref: "数据处理", why: "5 − 3 = 2" },
    { type: "num", stem: "狗有几只？", visual: { k: "emoji2", rows: [["🐱", 4], ["🐶", 7]] }, ans: 7, ref: "数据处理", why: "数狗那一行" },
    { type: "num", stem: "猫和狗一共有几只？", visual: { k: "emoji2", rows: [["🐱", 4], ["🐶", 7]] }, ans: 11, ref: "数据处理", why: "4 + 7 = 11" },
    { type: "num", stem: "汽车比公车多几辆？", visual: { k: "emoji2", rows: [["🚗", 6], ["🚲", 2], ["🚌", 3]] }, ans: 3, ref: "数据处理", why: "6 − 3 = 3" },
    { type: "choice", stem: "哪两种球一样多？", visual: { k: "emoji2", rows: [["⚽", 4], ["🏀", 4], ["🏓", 2]] }, opts: ["足球乒乓", "足球篮球", "篮球乒乓"], ans: 1, ref: "数据处理", why: "足球和篮球都是 4 个" },
    { type: "num", stem: "三种一共有几个？", visual: { k: "emoji2", rows: [["🌟", 5], ["🌙", 3], ["☀️", 2]] }, ans: 10, ref: "数据处理", why: "5 + 3 + 2 = 10" },
    { type: "num", stem: "葡萄比草莓多几个？", visual: { k: "emoji2", rows: [["🍓", 3], ["🍇", 6]] }, ans: 3, ref: "数据处理", why: "6 − 3 = 3" },
    { type: "choice", stem: "最多的是哪一个？", visual: { k: "emoji2", rows: [["🐟", 3], ["🐢", 2], ["🐦", 6]] }, opts: ["小鱼", "乌龟", "小鸟"], ans: 2, ref: "数据处理", why: "小鸟那一行最长" }
  ]
});

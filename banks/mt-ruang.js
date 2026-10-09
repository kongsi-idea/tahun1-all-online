window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "mt-ruang",
  subject: "数学",
  title: "空间",
  questions: [
    { type: "choice", stem: "这是什么立体图形？", visual: { k: "solid", s: "cube" }, opts: ["球体", "正方体", "圆柱体"], ans: 1, ref: "空间", why: "6 个面都是正方形" },
    { type: "choice", stem: "这是什么立体图形？", visual: { k: "solid", s: "sphere" }, opts: ["球体", "圆锥体", "长方体"], ans: 0, ref: "空间", why: "圆圆的，像球" },
    { type: "choice", stem: "这是什么立体图形？", visual: { k: "solid", s: "cylinder" }, opts: ["圆锥体", "球体", "圆柱体"], ans: 2, ref: "空间", why: "上下两个圆，像罐头" },
    { type: "choice", stem: "这是什么立体图形？", visual: { k: "solid", s: "cuboid" }, opts: ["长方体", "正方体", "圆柱体"], ans: 0, ref: "空间", why: "像盒子，面是长方形" },
    { type: "choice", stem: "这是什么平面图形？", visual: { k: "plane", s: "triangle" }, opts: ["圆", "三角形", "正方形"], ans: 1, ref: "空间", why: "有 3 条边" },
    { type: "choice", stem: "这是什么平面图形？", visual: { k: "plane", s: "circle" }, opts: ["三角形", "长方形", "圆"], ans: 2, ref: "空间", why: "没有直直的边，是圆" },
    { type: "choice", stem: "这是什么平面图形？", visual: { k: "plane", s: "rect" }, opts: ["长方形", "正方形", "三角形"], ans: 0, ref: "空间", why: "有 4 条边，两长两短" },
    { type: "choice", stem: "这是什么平面图形？", visual: { k: "plane", s: "square" }, opts: ["圆", "长方形", "正方形"], ans: 2, ref: "空间", why: "有 4 条边，一样长" },
    { type: "choice", stem: "哪一个最会滚动？", opts: [
      { t: "甲", visual: { k: "solid", s: "cube" } },
      { t: "乙", visual: { k: "solid", s: "cuboid" } },
      { t: "丙", visual: { k: "solid", s: "sphere" } }
    ], ans: 2, ref: "空间", why: "球体圆圆的，最会滚" },
    { type: "choice", stem: "○□○□○，下一个是什么？", opts: ["○", "□", "△"], ans: 1, ref: "空间", why: "圆、方轮流出现" }
  ]
});

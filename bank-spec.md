# 题库格式（bank-spec）

题库是一个 JS 文件，`window.BANKS.push({...})`。引擎只认这个格式。

```js
window.BANKS = window.BANKS || [];
window.BANKS.push({
  id: "bc-u1",                 // 唯一，小写英数与连字号
  subject: "华文",              // 华文 | 数学
  title: "第1单元 新的开始",     // 老师在控制台看到的名称
  questions: [ /* 见下 */ ]
});
```

## 题目 question

| 字段 | 必填 | 说明 |
|---|---|---|
| `type` | ✓ | `"choice"` 选择题；`"num"` 数字键盘题（答案是 0–99 的整数） |
| `stem` | ✓ | 题干，≤ 25 字，一年级看得懂。用马来西亚华语 |
| `say` | | 朗读文字（预设=stem 去掉符号）。多音字请写成「字，词」形式 |
| `visual` | | 题目配图，见下方 visual 种类 |
| `opts` | choice 必填 | 选项 2–4 个，每个是**短字符串**（≤ 6 字）；或 `{t:"文字", visual:{...}}` |
| `ans` | ✓ | choice：正确选项下标（从 0 起）；num：整数 |
| `ref` | | 出处。华文写「课本第N页」；数学写 DSKP 单元 |
| `why` | | 公布答案时显示的一句话讲解（≤ 20 字） |

**选项下标不要都是 0**：正确答案的位置要打散（在每份题库里 A/B/C 大致平均）。

## visual 种类（引擎负责画，你只写参数）

- `{k:"emoji", e:"🍎", n:5}` ：n 个 emoji 排成一行（n ≤ 10）
- `{k:"emoji2", rows:[["🍎",3],["🍌",2]]}` ：多种物件各一行（象形统计图/数一数）
- `{k:"clock", h:3, m:30}` ：模拟钟面（m 只用 0 或 30，一年级）
- `{k:"frac", shape:"circle"|"rect", parts:4, shade:1}` ：分成 parts 份、涂 shade 份
- `{k:"coin", v:50}` ：马币硬币，v ∈ 5,10,20,50（单位：sen）
- `{k:"note", v:1}` ：马币纸币，v ∈ 1,5,10（单位：RM）
- `{k:"money", items:[{k:"coin",v:20},{k:"note",v:1}]}` ：一排钱币
- `{k:"cmp", items:[{e:"✏️", len:3},{e:"✏️", len:5}]}` ：比较长度的两条横条（len 为格数 1–8）
- `{k:"weigh", left:"🍎", right:"🍌", heavier:"left"|"right"|"same"}` ：天平
- `{k:"cup", levels:[3,5,2]}` ：几杯水，levels 为各杯水位（1–6）
- `{k:"solid", s:"cube"|"cuboid"|"cylinder"|"sphere"|"cone"}` ：立体
- `{k:"plane", s:"circle"|"square"|"triangle"|"rect"}` ：平面图形
- `{k:"text", t:"7 + 2 = ?"}` ：大字算式

## 范围外
不要在题库里放长篇课文；不放图片文件路径；不放拼音（拼音不可靠）。

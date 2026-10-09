# 网课同步作答 · 交接

## ⏯️ 目前做到哪
2026-10-09 一口气做出 v1：老师控制台（teacher.html）＋学生端（index.html）＋20 份题库（华文第1–12单元、数学8个主题，各10题）。
实时连线用 Supabase Realtime Broadcast（共用 kongsi-idea 的 Supabase project，**不建表、不存任何资料**）。
本地 Playwright 联机验收已交给 verify；真实 iPad／学生设备实测待老师。

## 🧩 架构（一句话）
老师页是“唯一的真相来源”：持有题库与正确答案，经 Broadcast 频道 `online-<4位房号>` 发 `state`；学生只发 `join/hb/ans/help/light/hello`。学生端永远拿不到答案，公布时才收到。手写板笔迹以 `ink` 批次广播，晚到的学生用 `hello` 触发 `inkfull` 重放。

## 🚦 目前状态
- 课本出处：华文题库来自 `华文课本资料/一年级华文课本_全文提取.txt`，每题带 ref 页码
- DSKP 对照：数学题库按 `kongsi-idea/docs/dskp/tahun1/matematik.md` 范围；未逐条对 PDF，不写进 Hub 的 DSKP 索引
- 已知限制：没有账号验证，知道 `teacher.html` 的人理论上能冒充老师（学生端看不到答案，影响有限）；学生座号靠自己点，可能撞号

## ➡️ 下一步
1. 老师在 iPad 实测手写板与 Pencil
2. 学生朗读目前用浏览器语音，之后可改成预录 mp3（模板：tahun1-mt-pecahan 的 gen-voice.py）
3. 老师端「载入班级名单」把座号显示成名字（ClassCode）尚未做
4. 上架 Hub（缩图、DSKP、coverage 表）待老师确认后做

## ⚠️ 注意事项
- 本机测试：`python3 -m http.server 8123`，老师 http://localhost:8123/teacher.html ，学生 http://localhost:8123/?r=房号
- 加新题库：照 `bank-spec.md` 写 `banks/xxx.js`，并在 `teacher.html` 加一行 script
- Supabase Realtime 免费版并发连线有上限（整个 kongsi-idea project 共用），一班 30 多人没问题

## 🕐 最后更新
2026-10-09

/* 老师控制台：出题节奏、实时统计、座位墙、求救队列、手写板。
   题库与正确答案只在这里；学生端只收到“题目”，公布时才收到答案。 */
"use strict";

const $ = (s) => document.querySelector(s);
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const BANKS = (window.BANKS || []);
const SEATS_DEFAULT = 40;
Roster.set(store.get("ol-roster"));
const seatCount = () => Roster.count() || SEATS_DEFAULT;

/* 老师专用链接可带 #r=房号&roster=名单(base64)：读进本机后立刻从网址抹掉，名单不进源码、不上传服务器 */
let room = store.get("ol-t-room");
(function readHash() {
  if (location.hash.length < 2) return;
  const p = new URLSearchParams(location.hash.slice(1));
  try {
    if (p.get("r")) room = p.get("r").replace(/\D/g, "").slice(0, 8);
    if (p.get("roster")) {
      const bin = atob(p.get("roster").replace(/-/g, "+").replace(/_/g, "/"));
      const txt = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
      const g = Roster.parse(txt); if (g.length) { store.set("ol-roster", g); Roster.set(g); }
    }
  } catch (e) {}
  if (p.get("r") || p.get("roster")) history.replaceState(null, "", location.pathname);
})();
if (!room) room = String(Math.floor(100000 + Math.random() * 900000));
store.set("ol-t-room", room);

const T = Object.assign({
  bankId: BANKS[0] ? BANKS[0].id : "", qi: -1, phase: "wait", board: false,
  answers: {}, joined: {}, helps: [], lights: {}, score: {}, strokes: []
}, store.get("ol-t-state-" + room) || {});
AV.icons = T.icons || {};
T.adhocQs = T.adhocQs || [];
BANKS.push({ id: "adhoc", subject: "即兴", title: "即兴题（现场出）", questions: T.adhocQs });
let tab = "run", conn = false, seen = {}; // seen[seat] = 最近一次收到讯息的时间

const qk = () => T.bankId + ":" + T.qi;
const ak = (i) => T.bankId + ":" + i;
const bank = () => BANKS.find((b) => b.id === T.bankId) || BANKS[0];
const curQ = () => (bank() && T.qi >= 0 ? bank().questions[T.qi] : null);
const save = () => store.set("ol-t-state-" + room, T);
const esc = Vis.esc;

/* ── 发送给学生的状态（题目不含答案） ── */
function qPublic(q) {
  const { type, stem, say, visual, opts } = q;
  return { type, stem, say, visual, opts };
}
function dist() {
  const q = curQ(), a = T.answers[qk()] || {}, d = {};
  if (!q) return d;
  Object.values(a).forEach((v) => { d[v] = (d[v] || 0) + 1; });
  return d;
}
function nOnline() { return Object.keys(seen).filter((s) => Date.now() - seen[s] < 50000).length; }
function nAnswered() { return Object.keys(T.answers[qk()] || {}).length; }
function publish() {
  const q = curQ();
  const msg = { t: "state", seq: Date.now(), phase: T.phase, bk: T.bankId, scores: T.score, asked: Object.keys(T.scored || {}).length, qi: T.qi, total: bank() ? bank().questions.length : 0, board: T.board, prog: { a: nAnswered(), n: Math.max(nOnline(), nAnswered()) } };
  if (q && T.phase !== "wait") msg.q = qPublic(q);
  if (q && T.phase === "reveal") msg.rev = { ans: q.ans, why: q.why || "", dist: dist() };
  Room.send(msg);
  save(); draw();
}
let progTimer = null;
function pushProg() {
  if (progTimer) return;
  progTimer = setTimeout(() => {
    progTimer = null;
    Room.send({ t: "prog", a: nAnswered(), n: Math.max(nOnline(), nAnswered()) });
  }, 700);
}

/* ── 主按钮：出题 → 截止 → 公布 → 下一题 ── */
function primary() {
  const b = bank(); if (!b) return;
  if (T.phase === "wait") { T.qi = 0; T.phase = "q"; T.answers[qk()] = T.answers[qk()] || {}; }
  else if (T.phase === "q") T.phase = "lock";
  else if (T.phase === "lock") { T.phase = "reveal"; tally(); }
  else if (T.phase === "reveal") {
    if (T.qi + 1 >= b.questions.length) { T.phase = "wait"; T.qi = -1; }
    else { T.qi++; T.phase = "q"; T.answers[qk()] = {}; }
  }
  if (T.phase === "q") T.board = false;
  publish();
}
function tally() {
  const q = curQ(); if (!q) return;
  T.scored = T.scored || {};
  const key = T.bankId + ":" + T.qi;
  if (T.scored[key]) return; T.scored[key] = 1;
  Object.entries(T.answers[qk()] || {}).forEach(([s, v]) => { if (Number(v) === Number(q.ans)) T.score[s] = (T.score[s] || 0) + 1; });
}
function jump(i) { T.board = false; T.qi = i; T.phase = "q"; T.answers[ak(i)] = T.answers[ak(i)] || {}; publish(); }
function pickBank(id) { if (id === "adhoc" && !T.adhocQs.length) { adhocDlg(); return; } T.bankId = id; T.qi = -1; T.phase = "wait"; publish(); }
function toggleBoard() { T.board = !T.board; publish(); }
function newRoom() {
  if (!confirm("换新的课堂号码？学生要重新用新链接进来。")) return;
  location.href = location.pathname + "?new=1";
}
function resetAll() {
  if (!confirm("清空本节课的作答、求救记录和手写板？")) return;
  T.adhocQs.length = 0;
  Object.assign(T, { qi: -1, phase: "wait", answers: {}, helps: [], lights: {}, score: {}, scored: {}, strokes: [] });
  Room.send({ t: "inkclear" }); publish();
}
function resolveHelp(seat) { T.helps = T.helps.filter((h) => h.seat !== seat); save(); draw(); }

/* ── 收到学生讯息 ── */
function onMsg(m) {
  if (!m || (!m.seat && m.t !== "hello")) return;
  const s = m.seat; if (s) seen[s] = Date.now();
  if (s && m.icon && AV.icons[s] !== m.icon) { AV.icons[s] = m.icon; T.icons = AV.icons; }
  if (m.t === "join" || m.t === "hello") {
    if (s) T.joined[s] = Date.now();
    if (!onMsg.rt) onMsg.rt = setTimeout(() => { onMsg.rt = null; sendRoster(); publish(); sendInk(); }, 600); // 不重置计时，免得连续刷新的人被饿死
  } else if (m.t === "hb") {
    T.joined[s] = Date.now();
  } else if (m.t === "ans") {
    if (m.qi === T.qi && (!m.bk || m.bk === T.bankId) && T.phase === "q") { (T.answers[qk()] = T.answers[qk()] || {})[s] = m.v; pushProg(); }
  } else if (m.t === "help") {
    if (!T.helps.some((h) => h.seat === s)) { T.helps.push({ seat: s, ts: Date.now() }); Beep.ping(); }
  } else if (m.t === "light") {
    T.lights[s] = m.c;
  }
  scheduleDraw();
}
let drawT = null;
function scheduleDraw() { if (drawT) return; drawT = setTimeout(() => { drawT = null; save(); draw(); }, 250); }

/* ── 画面 ── */
function cellHtml(i) {
  const a = T.answers[qk()] || {}, q = curQ();
  const online = seen[i] && Date.now() - seen[i] < 50000, helped = T.helps.some((h) => h.seat === i);
  const answered = a[i] !== undefined, right = q && T.phase === "reveal" && answered && Number(a[i]) === Number(q.ans);
  const cls = ["cell", T.joined[i] ? (online ? "on" : "away") : "off", answered ? "ans" : "", helped ? "help" : "", T.phase === "reveal" && answered ? (right ? "right" : "wrong") : ""].join(" ");
  const lt = T.lights[i] ? `<i class="dot ${T.lights[i]}"></i>` : "";
  const nm = Roster.name(i);
  return `<button class="${cls}" onclick="resolveHelp(${i})" title="${nm || i + " 号"}">${avatar(i, 24)}<b>${nm ? esc(nm) : i}</b>${lt}${T.score[i] ? `<em>${T.score[i]}</em>` : ""}</button>`;
}
function seatWall() {
  if (Roster.groups) {
    return Roster.groups.map((grp, gi) => { const st = Roster.startOf(gi);
      return `<div class="wgrp"><small>第${gi + 1}组</small><div class="wgrow">${grp.map((_, k) => cellHtml(st + k + 1)).join("")}</div></div>`; }).join("");
  }
  let out = ""; for (let i = 1; i <= seatCount(); i++) out += cellHtml(i); return out;
}
function attendHtml() {
  const n = seatCount(); const here = []; const gone = [];
  for (let i = 1; i <= n; i++) (T.joined[i] ? here : gone).push(Roster.name(i) || i + "号");
  return `<div class="att"><b>点名：到 ${here.length} / ${n}</b>${gone.length && Roster.groups ? `<p>未到：${gone.map(esc).join("、")}</p>` : ""}</div>`;
}
function statsHtml() {
  const q = curQ(); if (!q) return `<p class="muted">按下面的大按钮开始出题</p>`;
  const d = dist(), tot = Object.values(d).reduce((x, y) => x + y, 0) || 1;
  if (q.type === "choice") {
    return q.opts.map((o, i) => {
      const n = d[i] || 0, txt = typeof o === "string" ? o : o.t;
      return `<div class="drow ${i === q.ans ? "ok" : ""}"><span>${OPT_STYLE[i].shape} ${esc(txt || "图")}</span><i style="width:${Math.max(n ? 6 : 0, Math.round(n / tot * 100))}%"></i><b>${n}</b></div>`;
    }).join("");
  }
  const rows = Object.entries(d).sort((a, b) => b[1] - a[1]).map(([k, n]) =>
    `<div class="drow ${Number(k) === Number(q.ans) ? "ok" : ""}"><span>${esc(k)}</span><i style="width:${Math.max(6, Math.round(n / tot * 100))}%"></i><b>${n}</b></div>`).join("");
  return rows || `<p class="muted">还没有人交答案</p>`;
}
function preview() {
  const q = curQ(); if (!q) return `<div class="wait"><h2>${esc(bank() ? bank().title : "没有题库")}</h2><p class="muted">共 ${bank() ? bank().questions.length : 0} 题</p></div>`;
  const ans = q.type === "choice" ? `${OPT_STYLE[q.ans].shape} ${esc(typeof q.opts[q.ans] === "string" ? q.opts[q.ans] : (q.opts[q.ans].t || "图"))}` : q.ans;
  return `<div class="qcard"><div class="qtop"><h1>${esc(q.stem)}</h1></div>${q.visual ? `<div class="qvis">${Vis.render(q.visual)}</div>` : ""}
    ${q.type === "choice" ? `<div class="popts">${q.opts.map((o, i) => `<span class="po" style="--c:${OPT_STYLE[i].color}">${OPT_STYLE[i].shape} ${esc(typeof o === "string" ? o : (o.t || ""))}${typeof o === "string" ? "" : Vis.render(o.visual)}</span>`).join("")}</div>` : ""}
    <p class="tkey">答案：<b>${ans}</b>　<small>${esc(q.ref || "")}${q.why ? " · " + esc(q.why) : ""}</small></p></div>`;
}
const PRI = { wait: "出题", q: "截止作答", lock: "公布答案", reveal: "下一题" };

function draw() {
  const b = bank(), bySubj = {};
  BANKS.forEach((x) => (bySubj[x.subject] = bySubj[x.subject] || []).push(x));
  const link = `${location.origin}${location.pathname.replace(/teacher\.html$/, "")}?r=${room}`;
  const helps = T.helps.slice().sort((a, b) => a.ts - b.ts);
  const html = `
  <header class="thead">
    <div class="rc">课堂号码 <b>${room}</b></div>
    <button class="chip" onclick="copyLink()">复制学生链接</button>
    <span class="chip ${conn ? "okc" : "badc"}">${conn ? "已连线" : "连线中…"}</span>
    <span class="chip">在线 <b>${nOnline()}</b></span>
    ${helps.map((h) => `<button class="chip helpchip" onclick="resolveHelp(${h.seat})">${avatar(h.seat, 26)}<b>${esc(Roster.name(h.seat) || h.seat + " 号")}</b> 求救 · 处理了</button>`).join("")}
    <span class="grow"></span>
    <button class="chip ${T.board ? "okc" : ""}" onclick="toggleBoard()">${T.board ? "学生正在看手写板" : "让学生看手写板"}</button>
    <button class="chip ${tab === "run" ? "tabon" : ""}" onclick="setTab('run')">出题</button>
    <button class="chip ${tab === "board" ? "tabon" : ""}" onclick="setTab('board')">手写板</button>
    <button class="chip" onclick="editRoster()">名单</button>
    <button class="chip" onclick="resetAll()">清空</button>
  </header>
  ${Roster.groups ? "" : `<div class="nobanner">还没有班级名单，学生只能用座号进来。<button class="chip tabon" onclick="editRoster()">贴上名单</button></div>`}
  <div class="tmain mode-${tab}">
    <aside class="tleft">
      <button class="bk adhocbtn" onclick="adhocDlg()">+ 即兴题</button>
      ${Object.keys(bySubj).map((s) => `<h3>${s}</h3>` + bySubj[s].map((x) => `<button class="bk ${x.id === T.bankId ? "on" : ""}" onclick="pickBank('${x.id}')">${esc(x.title)}<small>${x.questions.length} 题</small></button>`).join("")).join("") || '<p class="muted">题库没载入</p>'}
    </aside>
    <section class="tcenter" ${tab === "board" ? 'style="display:none"' : ""}>
      <div class="qnav">${b ? b.questions.map((_, i) => `<button class="${i === T.qi ? "on" : ""} ${T.answers[ak(i)] ? "done" : ""}" onclick="jump(${i})">${i + 1}</button>`).join("") : ""}</div>
      ${preview()}
      <div class="tstats"><div class="tstat-h">已交 <b>${nAnswered()}</b> / ${Math.max(nOnline(), nAnswered())}</div>${statsHtml()}</div>
      <div class="pbar"><button class="primary ${T.phase}" onclick="primary()">${PRI[T.phase]}</button></div>
    </section>
    <section class="tboard" ${tab === "board" ? "" : 'style="display:none"'}>
      <div class="btools">
        ${[["#1d1d2b","黑"],["#E8505B","红"],["#2563eb","蓝"],["#16a34a","绿"]].map(([c, n]) => `<button class="sw ${ink.c === c ? "on" : ""}" style="--c:${c}" onclick="inkTool('${c}',8)">${n}</button>`).join("")}
        <button class="sw ${ink.c === "#ffffff" ? "on" : ""}" onclick="inkTool('#ffffff',36)">橡皮</button>
        <button id="touchbtn" class="chip ${ink.touchOk ? "okc" : ""}" onclick="toggleTouch()">${ink.touchOk ? "手指也能写：开" : "只用笔写（防手掌）"}</button>
        <button class="chip" onclick="inkUndo()">↶ 撤销</button><button class="chip" onclick="inkClear()">清除</button>
        <span class="muted">${curQ() ? "题目：" + esc(curQ().stem) : ""}</span>
      </div>
      <canvas id="tcv" width="1200" height="720"></canvas>
    </section>
    <aside class="tright">
      <h3>求救 ${helps.length ? `<b class="red">${helps.length}</b>` : ""}</h3>
      ${helps.map((h) => `<div class="hrow"><span>${avatar(h.seat, 24)} ${Roster.name(h.seat) || h.seat + " 号"}</span><button class="chip" onclick="resolveHelp(${h.seat})">处理了</button></div>`).join("") || '<p class="muted">没有人求救</p>'}
      <h3>座位墙 <small>灰=未进入 · 绿框=已交 · 圆点=懂不懂</small></h3>
      ${attendHtml()}
      <div class="wall">${seatWall()}</div>
    </aside>
  </div>`;
  const keep = tab === "board" && document.getElementById("tcv");
  if (keep) { // 手写板打开时只更新工具列与侧栏，不要重建画布，免得笔迹闪掉
    document.querySelector(".thead").outerHTML = html.match(/<header[\s\S]*?<\/header>/)[0];
    document.querySelector(".tleft").innerHTML = html.match(/<aside class="tleft">([\s\S]*?)<\/aside>/)[1];
    document.querySelector(".tright").innerHTML = html.match(/<aside class="tright">([\s\S]*?)<\/aside>/)[1];
    return;
  }
  document.getElementById("app").innerHTML = html;
  if (tab === "board") initBoard();
}

function editRoster() {
  const cur = Roster.groups ? Roster.groups.map((g) => g.join(" ")).join("\n") : "";
  const m = document.createElement("div"); m.className = "modal";
  m.innerHTML = `<div class="mbox"><h2>班级名单</h2><p class="muted">每一行是一组，名字之间用空格隔开（和 EduNeo 的排法一样）。留空＝改用座号。<br>只存在这台 iPad 的浏览器里，不会上传到服务器。</p>
    <textarea id="rtext" rows="9" spellcheck="false" placeholder="刘伊祎 黄凯轩 马颖婕 赖军暐 吴钫嗪&#10;郭瑞杰 张恩珣 谢佳宸 刘乐蒽 许志安">${esc(cur)}</textarea>
    <div class="mrow"><button class="chip" id="rcancel">取消</button><button class="chip tabon" id="rsave">保存</button></div></div>`;
  document.body.appendChild(m);
  const ta = m.querySelector("#rtext"); ta.focus();
  m.querySelector("#rcancel").onclick = () => m.remove();
  m.querySelector("#rsave").onclick = () => {
    let g = Roster.parse(ta.value);
    if (g.length === 1 && g[0].length > 5) { const all = g[0]; g = []; for (let i = 0; i < all.length; i += 5) g.push(all.slice(i, i + 5)); } // 整份贴成一行时，每 5 人一组
    Roster.set(g.length ? g : null); store.set("ol-roster", Roster.groups);
    T.joined = {}; seen = {}; m.remove(); sendRoster(); publish();
  };
}

function adhocDlg() {
  const st = { type: "num", n: 3, ans: null };
  const m = document.createElement("div"); m.className = "modal";
  const letters = "ABCD";
  const paint = () => {
    const seg = (k, v, label) => `<button class="chip ${st[k] === v ? "tabon" : ""}" data-k="${k}" data-v="${v}">${label}</button>`;
    m.innerHTML = `<div class="mbox"><h2>即兴题</h2><p class="muted">你口头或在手写板上出题，这里只设定学生怎么答、正确答案是什么。</p>
      <div class="seg">${seg("type", "num", "数字答案")}${seg("type", "choice", "选择 A B C")}</div>
      ${st.type === "choice"
        ? `<div class="seg"><span>选项数</span>${[2, 3, 4].map((n) => seg("n", n, n)).join("")}</div>
           <div class="seg"><span>正确答案</span>${letters.slice(0, st.n).split("").map((L, i) => seg("ans", i, L)).join("")}</div>`
        : `<div class="seg"><span>正确答案</span><input id="adn" inputmode="numeric" maxlength="4" value="${st.ans === null ? "" : st.ans}" placeholder="数字"></div>`}
      <div class="mrow"><button class="chip" id="ac">取消</button><button class="chip tabon" id="ao">出题</button></div></div>`;
    m.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => {
      const keepNum = m.querySelector("#adn"); if (keepNum) st.ans = keepNum.value === "" ? null : Number(keepNum.value);
      const k = b.dataset.k, v = b.dataset.v; st[k] = k === "type" ? v : Number(v);
      if (k === "type") st.ans = null; if (k === "n" && st.ans >= st.n) st.ans = null; paint();
    }));
    m.querySelector("#ac").onclick = () => m.remove();
    m.querySelector("#ao").onclick = () => {
      let ans = st.ans;
      if (st.type === "num") { const el = m.querySelector("#adn"); ans = el && el.value !== "" ? Number(el.value) : null; }
      if (ans === null || Number.isNaN(ans)) { alert("请先填正确答案"); return; }
      const q = st.type === "num"
        ? { type: "num", stem: "看老师出的题，写出答案", ans, ref: "即兴题" }
        : { type: "choice", stem: "看老师出的题，选一个答案", opts: letters.slice(0, st.n).split(""), ans, ref: "即兴题" };
      T.board = false; T.adhocQs.push(q); T.bankId = "adhoc"; T.qi = T.adhocQs.length - 1; T.phase = "q"; T.answers[qk()] = {};
      m.remove(); publish();
    };
  };
  document.body.appendChild(m); paint();
}
function setTab(t) { tab = t; document.getElementById("app").innerHTML = ""; draw(); }
function copyLink() {
  const link = `${location.origin}${location.pathname.replace(/teacher\.html$/, "")}?r=${room}`;
  (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => alert("已复制，贴到 Meet 聊天室：\n" + link), () => prompt("复制这个链接：", link));
}

/* ── 手写板 ── */
const ink = { c: "#1d1d2b", w: 8, cur: null, pending: [], timer: null, touchOk: store.get("ol-touchok") === true };
function inkTool(c, w) { ink.c = c; ink.w = w; document.querySelectorAll(".sw").forEach((b) => b.classList.remove("on")); draw(); }
function redrawBoard() {
  const cv = document.getElementById("tcv"); if (!cv) return;
  const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  T.strokes.forEach((s) => {
    ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.beginPath();
    s.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    if (s.pts.length === 1) ctx.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]);
    ctx.stroke();
  });
}
function flushInk(end) {
  if (!ink.cur || (!ink.pending.length && !end)) return;
  Room.send({ t: "ink", id: ink.cur.id, c: ink.cur.c, w: ink.cur.w, pts: ink.pending });
  ink.pending = [];
}
function initBoard() {
  const cv = document.getElementById("tcv"); redrawBoard();
  const ctx = cv.getContext("2d");
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * cv.width / r.width), Math.round((e.clientY - r.top) * cv.height / r.height)]; };
  cv.style.touchAction = "none";
  cv.onpointerdown = (e) => {
    if (e.pointerType === "touch" && !ink.touchOk) return; // 预设只认 Apple Pencil／鼠标，手掌与手指不画
    cv.setPointerCapture(e.pointerId);
    const p = pos(e);
    ink.cur = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), c: ink.c, w: ink.w, pts: [p] };
    T.strokes.push(ink.cur); ink.pending = [p];
    ctx.strokeStyle = ink.c; ctx.lineWidth = ink.w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + 0.1, p[1]); ctx.stroke();
    ink.timer = setInterval(() => flushInk(false), 60);
  };
  cv.onpointermove = (e) => {
    if (!ink.cur) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (evs.length ? evs : [e]).forEach((ev) => {
      const p = pos(ev), last = ink.cur.pts[ink.cur.pts.length - 1];
      if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) < 2) return;
      ink.cur.pts.push(p); ink.pending.push(p);
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    });
  };
  const up = () => { if (!ink.cur) return; clearInterval(ink.timer); flushInk(true); ink.cur = null; save(); };
  cv.onpointerup = up; cv.onpointercancel = up;
}
function toggleTouch() {
  ink.touchOk = !ink.touchOk; store.set("ol-touchok", ink.touchOk);
  const b = document.getElementById("touchbtn");
  if (b) { b.textContent = ink.touchOk ? "手指也能写：开" : "只用笔写（防手掌）"; b.classList.toggle("okc", ink.touchOk); }
}
function inkUndo() { T.strokes.pop(); Room.send({ t: "inkundo" }); redrawBoard(); save(); }
function inkClear() { T.strokes = []; Room.send({ t: "inkclear" }); redrawBoard(); save(); }
function sendRoster() { if (Roster.groups) Room.send({ t: "roster", groups: Roster.groups }); }
function sendInk() {
  if (!T.strokes.length) return;
  Room.send({ t: "inkfull", strokes: T.strokes.map((s) => ({ id: s.id, c: s.c, w: s.w, pts: s.pts })) });
}

/* ── 启动 ── */
(function init() {
  if (new URLSearchParams(location.search).get("new")) {
    room = String(Math.floor(100000 + Math.random() * 900000)); store.set("ol-t-room", room);
    history.replaceState(null, "", location.pathname);
    location.reload(); return;
  }
  Object.assign(window, { adhocDlg, toggleTouch, editRoster, primary, jump, pickBank, toggleBoard, newRoom, resetAll, resolveHelp, setTab, copyLink, inkTool, inkUndo, inkClear });
  Room.connect(room, onMsg, (st) => { conn = st === "SUBSCRIBED"; if (conn) { sendRoster(); publish(); } else draw(); });
  document.addEventListener("pointerdown", Beep.unlock, { once: true });
  document.addEventListener("touchstart", () => {}, { passive: true });
  ["selectstart", "contextmenu", "gesturestart"].forEach((ev) => document.addEventListener(ev, (e) => { if (tab === "board") e.preventDefault(); }));
  document.addEventListener("keydown", (e) => { if (e.code === "Space" && tab === "run" && e.target === document.body) { e.preventDefault(); primary(); } });
  draw();
  setInterval(() => { if (tab === "run") draw(); }, 5000); // 在线状态定时刷新
})();

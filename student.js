/* 学生端：跟着老师的节奏看题、作答、求救。
   学生端拿到的题目不含正确答案；答案要老师「公布」那一刻才会送来。 */
"use strict";

const $app = document.getElementById("app");
const $conn = document.getElementById("conn");
const qs = new URLSearchParams(location.search);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

const S = {
  room: (qs.get("r") || store.get("ol-room") || "").replace(/\D/g, "").slice(0, 8),
  seat: 0,
  phase: "wait", qi: -1, total: 0, q: null, rev: null, board: false, prog: { a: 0, n: 0 },
  sel: null, numBuf: "", stateAt: 0,
  helpUntil: 0, light: "", connected: false, picking: false,
  ink: { strokes: [], byId: {} }
};

/* ── 小工具 ── */
const h = (s) => Vis.esc(s);
function flashTitle() {
  if (!document.hidden) return;
  const base = document.title; let on = true;
  const t = setInterval(() => {
    document.title = on ? "老师出题啦！" : base; on = !on;
    if (!document.hidden) { clearInterval(t); document.title = base; }
  }, 900);
}

/* ── 连线 ── */
function startRoom() {
  Room.connect(S.room, onMsg, (st) => {
    S.connected = st === "SUBSCRIBED";
    $conn.hidden = S.connected;
    if (S.connected) { S.needResend = true; Room.send({ t: "hello", seat: S.seat || 0, icon: AV.icons[S.seat] }); }
  });
  setInterval(() => { if (S.connected && S.seat) Room.send({ t: "hb", seat: S.seat, icon: AV.icons[S.seat] }); }, 15000);
}

function onMsg(m) {
  if (!m || !m.t) return;
  if (m.t === "state") {
    if (m.seq < S.stateAt) return;
    const newQ = m.phase === "q" && (m.qi !== S.qi || m.seq !== S.stateAt) && S.phase !== "q";
    const changedQ = m.qi !== S.qi;
    S.stateAt = m.seq;
    S.phase = m.phase; S.total = m.total; S.board = !!m.board;
    if (changedQ) { S.sel = null; S.numBuf = ""; }
    S.qi = m.qi; persist(); S.q = m.q || null; S.rev = m.rev || null; S.prog = m.prog || S.prog;
    if (m.phase === "q" && (changedQ || newQ)) { Beep.ping(); flashTitle(); }
    if (m.phase === "reveal" && S.rev) {
      const mine = myAnswer();
      if (mine !== null) (isRight() ? Beep.ok : Beep.no)();
    }
    if (S.needResend && m.phase === "q") { S.needResend = false; if (myAnswer() !== null) sendAns(); }
    render();
  } else if (m.t === "roster") {
    Roster.set(m.groups); if (!S.seat || S.seat) render();
  } else if (m.t === "prog") {
    S.prog = { a: m.a, n: m.n };
    const el = document.getElementById("prog"); if (el) el.innerHTML = progHtml();
  } else if (m.t === "ink") {
    inkIn(m);
  } else if (m.t === "inkfull") {
    S.ink = { strokes: [], byId: {} };
    (m.strokes || []).forEach(inkIn);
  } else if (m.t === "inkclear") {
    S.ink = { strokes: [], byId: {} }; inkRedraw();
  } else if (m.t === "inkundo") {
    S.ink.strokes.pop(); inkRedraw();
  }
}

function persist() { store.set("ol-a-" + S.room, JSON.stringify({ qi: S.qi, sel: S.sel, numBuf: S.numBuf, light: S.light, submitted: S.submitted })); }
function myAnswer() {
  if (!S.q) return null;
  if (S.q.type === "num") return S.numBuf === "" ? null : Number(S.numBuf);
  return S.sel;
}
function isRight() { return S.rev && myAnswer() !== null && Number(myAnswer()) === Number(S.rev.ans); }

/* ── 手写板（只看不写） ── */
function inkIn(m) {
  let s = S.ink.byId[m.id];
  if (!s) { s = { id: m.id, c: m.c, w: m.w, pts: [] }; S.ink.byId[m.id] = s; S.ink.strokes.push(s); }
  s.pts.push(...m.pts);
  inkRedraw();
}
function inkRedraw() {
  const cv = document.getElementById("inkcv"); if (!cv) return;
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  S.ink.strokes.forEach((s) => {
    ctx.strokeStyle = s.c; ctx.lineWidth = s.w;
    ctx.beginPath();
    s.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    if (s.pts.length === 1) ctx.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]);
    ctx.stroke();
  });
}

/* ── 动作 ── */
function sendAns() {
  const v = myAnswer();
  if (v === null || !S.q) return;
  Room.send({ t: "ans", seat: S.seat, qi: S.qi, v });
}
function pickOpt(i) {
  if (S.phase !== "q") return;
  S.sel = i; persist(); sendAns(); render();
}
function key(k) {
  if (S.phase !== "q") return;
  if (k === "del") S.numBuf = S.numBuf.slice(0, -1);
  else if (S.numBuf.length < 2) S.numBuf += String(k);
  persist(); render();
}
function submitNum() {
  if (S.phase !== "q" || S.numBuf === "") return;
  sendAns(); S.submitted = S.qi; persist(); render();
}
function help() {
  if (Date.now() < S.helpUntil) return;
  S.helpUntil = Date.now() + 30000;
  Room.send({ t: "help", seat: S.seat });
  render(); tickHelp();
}
function tickHelp() {
  const b = document.getElementById("helpbtn"); if (!b) return;
  const left = Math.ceil((S.helpUntil - Date.now()) / 1000);
  if (left > 0) { b.disabled = true; b.innerHTML = `<span>${Icon.check}</span><small>老师收到了 ${left}</small>`; setTimeout(tickHelp, 500); }
  else { b.disabled = false; b.innerHTML = `<span>${Icon.help}</span><small>求救</small>`; }
}
function setLight(c) {
  S.light = c; persist(); Room.send({ t: "light", seat: S.seat, c }); render();
}

/* ── 画面 ── */
function progHtml() {
  const { a, n } = S.prog; const pct = n ? Math.round((a / n) * 100) : 0;
  return `<div class="prog-bar"><i style="width:${pct}%"></i></div><small>已有 <b>${a}</b> / ${n} 位同学答好了</small>`;
}
function topbar() {
  const left = Math.ceil((S.helpUntil - Date.now()) / 1000);
  return `<header class="topbar">
    <div class="me"><button class="avbtn" onclick="pickIcon()" aria-label="换图标">${avatar(S.seat, 44)}</button><b>${Roster.name(S.seat) ? h(Roster.name(S.seat)) : S.seat + " 号"}</b>${S.total ? `<small>第 ${S.qi + 1}/${S.total} 题</small>` : ""}</div>
    <div class="lights" role="group" aria-label="我懂不懂">
      <button class="lt g ${S.light === "g" ? "on" : ""}" onclick="setLight('g')"><i class="ld"></i><small>懂了</small></button>
      <button class="lt y ${S.light === "y" ? "on" : ""}" onclick="setLight('y')"><i class="ld"></i><small>有点懂</small></button>
      <button class="lt r ${S.light === "r" ? "on" : ""}" onclick="setLight('r')"><i class="ld"></i><small>不懂</small></button>
    </div>
    <button id="helpbtn" class="help" onclick="help()" ${left > 0 ? "disabled" : ""}>${left > 0 ? `<span>${Icon.check}</span><small>老师收到了</small>` : `<span>${Icon.help}</span><small>求救</small>`}</button>
  </header>`;
}
function questionHtml() {
  const q = S.q; if (!q) return "";
  return `<section class="qcard">
    <div class="qtop"><button class="say" onclick="Speak.say(S.q.say||S.q.stem)" aria-label="朗读题目">${Icon.speaker}</button><h1>${h(q.stem)}</h1></div>
    ${q.visual ? `<div class="qvis">${Vis.render(q.visual)}</div>` : ""}
  </section>`;
}
function answerArea() {
  const q = S.q;
  if (q.type === "choice") {
    return `<div class="opts n${q.opts.length}">${q.opts.map((o, i) => {
      const os = OPT_STYLE[i], txt = typeof o === "string" ? o : o.t, vis = typeof o === "string" ? "" : Vis.render(o.visual);
      return `<button class="opt ${S.sel === i ? "sel" : ""}" style="--c:${os.color}" onclick="pickOpt(${i})"><span class="mk">${os.shape}</span><span class="ot">${vis}${txt ? h(txt) : ""}</span></button>`;
    }).join("")}</div>
    <p class="hint">${S.sel === null ? "点一个答案" : "已选好了 ✓　想改可以再点别的"}</p>`;
  }
  const done = S.submitted === S.qi;
  return `<div class="numwrap"><div class="numshow ${done ? "done" : ""}">${S.numBuf === "" ? "?" : h(S.numBuf)}</div>
    <div class="keypad">${[1,2,3,4,5,6,7,8,9].map((k) => `<button onclick="key(${k})">${k}</button>`).join("")}
      <button class="k-del" onclick="key('del')">⌫</button><button onclick="key(0)">0</button><button class="k-ok" onclick="submitNum()">✔</button></div></div>
    <p class="hint">${done ? "已交出 ✓　想改就改，再按 ✔" : "先在纸上算，再按数字，最后按 ✔"}</p>`;
}
function boardHtml() {
  return `<section class="board"><canvas id="inkcv" width="1200" height="720"></canvas></section>`;
}
function revealHtml() {
  const r = S.rev, q = S.q, mine = myAnswer();
  const rightTxt = q.type === "choice" ? `${OPT_STYLE[r.ans].shape} ${h(typeof q.opts[r.ans] === "string" ? q.opts[r.ans] : q.opts[r.ans].t)}` : h(r.ans);
  const tot = Object.values(r.dist || {}).reduce((a, b) => a + b, 0) || 1;
  const rows = Object.entries(r.dist || {}).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => {
    const label = q.type === "choice" ? OPT_STYLE[k].shape + " " + (typeof q.opts[k] === "string" ? q.opts[k] : q.opts[k].t) : k;
    return `<div class="drow ${Number(k) === Number(r.ans) ? "ok" : ""}"><span>${h(label)}</span><i style="width:${Math.max(6, Math.round((n / tot) * 100))}%"></i><b>${n}</b></div>`;
  }).join("");
  const verdict = mine === null ? `<div class="res none">这题你还没答 · 没关系，看看答案</div>`
    : isRight() ? `<div class="res good">答对了！</div>` : `<div class="res bad">差一点点 · 看看正确答案</div>`;
  return `${verdict}
    <div class="answer">正确答案：<b>${rightTxt}</b></div>
    ${r.why ? `<p class="why"><span class="bulb">${Icon.bulb}</span>${h(r.why)}</p>` : ""}
    <div class="dist"><small>全班怎么选</small>${rows}</div>`;
}

function render() {
  if (!S.room) return renderRoom();
  if (!S.seat) return renderSeat();
  if (!AV.icons[S.seat] || S.picking) return renderIcon();
  if (S.board) { // 老师开手写板：全屏专心看，学生什么都不能操作
    const q = S.q && S.phase !== "wait" ? S.q : null;
    $app.innerHTML = `<div class="boardfs">${q ? `<div class="bq"><b>${h(q.stem)}</b>${q.visual ? `<div class="bqv">${Vis.render(q.visual)}</div>` : ""}</div>` : ""}<canvas id="inkcv" width="1200" height="720"></canvas></div>`;
    inkRedraw(); return;
  }
  let body = "";
  if (S.phase === "wait" || !S.q) {
    body = `<section class="wait"><div class="dots"><i></i><i></i><i></i></div><h1>老师马上出题</h1><p>请听老师说话，题目一出来会“叮咚”叫你</p></section>`;
  } else if (S.phase === "q") {
    body = questionHtml() + answerArea() + `<div id="prog" class="prog">${progHtml()}</div>`;
  } else if (S.phase === "lock") {
    const m = myAnswer();
    body = questionHtml() + `<section class="locked"><div class="bigicon">${Icon.clock}</div><h2>时间到！</h2><p>${m === null ? "这题你没有答" : "你的答案：" + (S.q.type === "choice" ? OPT_STYLE[m].shape : m)}</p><p>等老师公布答案</p></section>`;
  } else if (S.phase === "reveal") {
    body = questionHtml() + revealHtml();
  }
  $app.innerHTML = topbar() + `<div class="stage">${body}</div>`;
  if (Date.now() < S.helpUntil) tickHelp();
}

function renderRoom() {
  $app.innerHTML = `<div class="stage center"><section class="join"><div class="dots"><i></i><i></i><i></i></div><h1>请用老师给的链接进来</h1><p>在 Meet 聊天室点老师发的那个链接就可以了，不用输入号码</p></section></div>`;
}
function setRoom() {}
function renderSeat() {
  if (!Roster.groups) {
    $app.innerHTML = `<div class="stage center"><section class="join"><div class="dots"><i></i><i></i><i></i></div><h1>等老师准备好</h1><p>老师还在准备名单，马上就好</p></section></div>`;
    return;
  }
  let g = "";
  Roster.groups.forEach((grp, gi) => {
    const st = Roster.startOf(gi);
    g += `<div class="sg"><small>第 ${gi + 1} 组</small><div class="sgrow">${grp.map((nm, k) => `<button onclick="setSeat(${st + k + 1})">${avatar(st + k + 1, 38)}<b>${h(nm)}</b></button>`).join("")}</div></div>`;
  });
  $app.innerHTML = `<div class="stage center"><section class="join"><h1>你是谁？</h1><p>点你的名字</p>${g}</section></div>`;
}
function renderIcon() {
  $app.innerHTML = `<div class="stage center"><section class="join"><h1>选你的小图标</h1><p>${Roster.name(S.seat) ? h(Roster.name(S.seat)) + "，" : ""}点一个喜欢的</p>
    <div class="icongrid">${AV_ICONS.map((k) => `<button style="--c:${iconColor(k)}" onclick="setIcon('${k}')" aria-label="${k}"><i class="ph-fill ph-${k}"></i></button>`).join("")}</div></section></div>`;
}
function pickIcon() { S.picking = true; render(); }
function setIcon(k) {
  AV.icons[S.seat] = k; store.set("ol-icon-" + S.room + "-" + S.seat, k); S.picking = false;
  Room.send({ t: "join", seat: S.seat, icon: k }); render();
}
function setSeat(i) {
  Beep.unlock();
  S.seat = i; store.set("ol-seat-" + S.room, String(i)); { const ic = store.get("ol-icon-" + S.room + "-" + i); if (ic) AV.icons[i] = ic; }
  Room.send({ t: "join", seat: i, icon: AV.icons[i] }); render();
}

(function init() {
  window.setIcon = setIcon; window.pickIcon = pickIcon; window.setRoom = setRoom; window.setSeat = setSeat; window.pickOpt = pickOpt; window.key = key;
  window.submitNum = submitNum; window.help = help; window.setLight = setLight;
  if (S.room) { store.set("ol-room", S.room); S.seat = Number(store.get("ol-seat-" + S.room)) || 0;
    { const ic = store.get("ol-icon-" + S.room + "-" + S.seat); if (ic) AV.icons[S.seat] = ic; }
    try { const a = JSON.parse(store.get("ol-a-" + S.room) || "null"); if (a) { S.qi = a.qi; S.sel = a.sel; S.numBuf = a.numBuf || ""; S.light = a.light || ""; S.submitted = a.submitted; } } catch (e) {} }
  render();
  if (S.room) startRoom();
  document.addEventListener("pointerdown", Beep.unlock, { once: true });
})();

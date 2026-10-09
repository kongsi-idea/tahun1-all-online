/* 网课同步作答：共用模块（连线 / 配图 / 朗读 / 提示音）
   老师端与学生端都载入这份。题库（含正确答案）只有老师端载入。 */
"use strict";

const SEAT_ANIMALS = ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦉","🐺","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐢","🐍","🐙","🦀","🐠","🐬","🐳","🦒","🐘","🦓","🐿️","🦔"];
const OPT_STYLE = [
  { name: "A", shape: "●", color: "#E8505B" },
  { name: "B", shape: "■", color: "#3B82F6" },
  { name: "C", shape: "▲", color: "#22A06B" },
  { name: "D", shape: "★", color: "#F2A81D" }
];

/* ── 连线：Supabase Realtime Broadcast（不建表，不存任何资料） ── */
const Room = (() => {
  let client = null, channel = null, handler = () => {}, statusCb = () => {};
  function connect(code, onMsg, onStatus) {
    handler = onMsg; statusCb = onStatus || (() => {});
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: { params: { eventsPerSecond: 30 } }
    });
    channel = client.channel("online-" + code, { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "m" }, (p) => handler(p.payload));
    channel.subscribe((s) => statusCb(s));
  }
  function send(msg) {
    if (!channel) return;
    channel.send({ type: "broadcast", event: "m", payload: msg });
  }
  return { connect, send };
})();

/* ── 配图：把题库里的 visual 参数画成 SVG / emoji ── */
const Vis = (() => {
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  function clock(h, m) {
    const hourAng = ((h % 12) + m / 60) * 30, minAng = m * 6;
    let ticks = "", nums = "";
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      nums += `<text x="${100 + 70 * Math.cos(a)}" y="${106 + 70 * Math.sin(a)}" text-anchor="middle" font-size="22" font-weight="800" fill="#2B2A4C">${i === 0 ? 12 : i}</text>`;
    }
    return `<svg viewBox="0 0 200 200" class="vis-svg" role="img" aria-label="钟面"><circle cx="100" cy="100" r="92" fill="#fff" stroke="#2B2A4C" stroke-width="7"/>${ticks}${nums}
      <line x1="100" y1="100" x2="100" y2="52" stroke="#2B2A4C" stroke-width="9" stroke-linecap="round" transform="rotate(${hourAng} 100 100)"/>
      <line x1="100" y1="100" x2="100" y2="30" stroke="#E8505B" stroke-width="6" stroke-linecap="round" transform="rotate(${minAng} 100 100)"/>
      <circle cx="100" cy="100" r="7" fill="#2B2A4C"/></svg>`;
  }
  function frac(shape, parts, shade) {
    const col = "#F2A81D", base = "#fff", line = "#2B2A4C";
    if (shape === "rect") {
      const w = 220 / parts; let r = "";
      for (let i = 0; i < parts; i++) r += `<rect x="${10 + i * w}" y="30" width="${w}" height="100" fill="${i < shade ? col : base}" stroke="${line}" stroke-width="4"/>`;
      return `<svg viewBox="0 0 240 160" class="vis-svg" role="img" aria-label="分数图">${r}</svg>`;
    }
    let r = "";
    for (let i = 0; i < parts; i++) {
      const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
      const x0 = 100 + 85 * Math.cos(a0), y0 = 100 + 85 * Math.sin(a0), x1 = 100 + 85 * Math.cos(a1), y1 = 100 + 85 * Math.sin(a1);
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      r += parts === 1
        ? `<circle cx="100" cy="100" r="85" fill="${i < shade ? col : base}" stroke="${line}" stroke-width="4"/>`
        : `<path d="M100 100 L${x0} ${y0} A85 85 0 ${large} 1 ${x1} ${y1} Z" fill="${i < shade ? col : base}" stroke="${line}" stroke-width="4" stroke-linejoin="round"/>`;
    }
    return `<svg viewBox="0 0 200 200" class="vis-svg" role="img" aria-label="分数图">${r}</svg>`;
  }
  const COIN_COL = { 5: "#C08A4B", 10: "#C9CDD3", 20: "#C9CDD3", 50: "#D8DCE2" };
  function coin(v) {
    return `<svg viewBox="0 0 100 100" class="vis-coin" role="img" aria-label="${v}仙硬币"><circle cx="50" cy="50" r="44" fill="${COIN_COL[v] || "#C9CDD3"}" stroke="#6B6F7A" stroke-width="5"/><circle cx="50" cy="50" r="35" fill="none" stroke="#6B6F7A" stroke-width="2" stroke-dasharray="3 4"/><text x="50" y="62" text-anchor="middle" font-size="34" font-weight="900" fill="#3A3D46">${v}</text><text x="50" y="82" text-anchor="middle" font-size="13" font-weight="800" fill="#3A3D46">SEN</text></svg>`;
  }
  const NOTE_COL = { 1: "#3B82F6", 5: "#22A06B", 10: "#E8505B" };
  function note(v) {
    return `<svg viewBox="0 0 200 100" class="vis-note" role="img" aria-label="${v}令吉纸币"><rect x="4" y="6" width="192" height="88" rx="10" fill="${NOTE_COL[v] || "#3B82F6"}" stroke="#2B2A4C" stroke-width="4"/><rect x="14" y="16" width="172" height="68" rx="6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><text x="100" y="62" text-anchor="middle" font-size="44" font-weight="900" fill="#fff">RM${v}</text></svg>`;
  }
  function solid(s) {
    const st = `stroke="#2B2A4C" stroke-width="4" stroke-linejoin="round"`;
    const m = {
      cube: `<polygon points="40,70 120,70 120,150 40,150" fill="#7DB8FF" ${st}/><polygon points="40,70 80,35 160,35 120,70" fill="#B7D8FF" ${st}/><polygon points="120,70 160,35 160,115 120,150" fill="#4F93E8" ${st}/>`,
      cuboid: `<polygon points="20,80 140,80 140,140 20,140" fill="#FFB36B" ${st}/><polygon points="20,80 55,45 175,45 140,80" fill="#FFD3A1" ${st}/><polygon points="140,80 175,45 175,105 140,140" fill="#E8903F" ${st}/>`,
      cylinder: `<path d="M45 50 L45 140 A45 16 0 0 0 135 140 L135 50 Z" fill="#6FD3A0" ${st}/><ellipse cx="90" cy="50" rx="45" ry="16" fill="#A8EBC8" ${st}/>`,
      sphere: `<circle cx="90" cy="90" r="58" fill="#F58A92" ${st}/><ellipse cx="70" cy="68" rx="16" ry="10" fill="#fff" fill-opacity=".5"/>`,
      cone: `<path d="M90 25 L140 140 A50 16 0 0 1 40 140 Z" fill="#C7A6F5" ${st}/>`
    };
    return `<svg viewBox="0 0 180 180" class="vis-svg" role="img" aria-label="立体">${m[s] || ""}</svg>`;
  }
  function plane(s) {
    const st = `fill="#FFD166" stroke="#2B2A4C" stroke-width="5" stroke-linejoin="round"`;
    const m = {
      circle: `<circle cx="90" cy="90" r="62" ${st}/>`,
      square: `<rect x="32" y="32" width="116" height="116" ${st}/>`,
      rect: `<rect x="14" y="46" width="152" height="88" ${st}/>`,
      triangle: `<polygon points="90,26 156,148 24,148" ${st}/>`
    };
    return `<svg viewBox="0 0 180 180" class="vis-svg" role="img" aria-label="平面图形">${m[s] || ""}</svg>`;
  }
  function cmp(items) {
    let y = 18, out = "";
    items.forEach((it) => {
      out += `<text x="6" y="${y + 22}" font-size="26">${it.e || ""}</text><rect x="46" y="${y}" width="${it.len * 30}" height="30" rx="8" fill="#6FA8FF" stroke="#2B2A4C" stroke-width="3"/>`;
      y += 50;
    });
    return `<svg viewBox="0 0 300 ${y}" class="vis-svg wide" role="img" aria-label="比长短">${out}</svg>`;
  }
  function weigh(left, right, heavier) {
    const tilt = heavier === "left" ? -12 : heavier === "right" ? 12 : 0;
    return `<svg viewBox="0 0 260 180" class="vis-svg wide" role="img" aria-label="天平">
      <polygon points="130,150 105,172 155,172" fill="#8A6A4B" stroke="#2B2A4C" stroke-width="3"/><line x1="130" y1="60" x2="130" y2="150" stroke="#2B2A4C" stroke-width="6"/>
      <g transform="rotate(${tilt} 130 60)"><line x1="30" y1="60" x2="230" y2="60" stroke="#2B2A4C" stroke-width="7" stroke-linecap="round"/>
      <g transform="rotate(${-tilt} 30 60)"><line x1="30" y1="60" x2="30" y2="86" stroke="#2B2A4C" stroke-width="3"/><path d="M5 86 h50 a25 22 0 0 1 -50 0z" fill="#FFD166" stroke="#2B2A4C" stroke-width="3"/><text x="30" y="82" text-anchor="middle" font-size="34">${left}</text></g>
      <g transform="rotate(${-tilt} 230 60)"><line x1="230" y1="60" x2="230" y2="86" stroke="#2B2A4C" stroke-width="3"/><path d="M205 86 h50 a25 22 0 0 1 -50 0z" fill="#FFD166" stroke="#2B2A4C" stroke-width="3"/><text x="230" y="82" text-anchor="middle" font-size="34">${right}</text></g></g></svg>`;
  }
  function cup(levels) {
    let out = "";
    levels.forEach((lv, i) => {
      const x = 14 + i * 80, h = lv * 16;
      out += `<rect x="${x + 4}" y="${130 - h}" width="52" height="${h}" fill="#7DC4FF"/><path d="M${x} 30 L${x + 6} 130 H${x + 54} L${x + 60} 30" fill="none" stroke="#2B2A4C" stroke-width="5" stroke-linejoin="round"/>`;
    });
    return `<svg viewBox="0 0 ${14 + levels.length * 80} 150" class="vis-svg wide" role="img" aria-label="水杯">${out}</svg>`;
  }

  function render(v) {
    if (!v) return "";
    switch (v.k) {
      case "emoji": return `<div class="vis-emoji">${(v.e + " ").repeat(v.n).trim()}</div>`;
      case "emoji2": return `<div class="vis-emoji2">${v.rows.map((r) => `<div>${(r[0] + " ").repeat(r[1]).trim()}</div>`).join("")}</div>`;
      case "clock": return clock(v.h, v.m || 0);
      case "frac": return frac(v.shape, v.parts, v.shade);
      case "coin": return coin(v.v);
      case "note": return note(v.v);
      case "money": return `<div class="vis-money">${v.items.map(render).join("")}</div>`;
      case "cmp": return cmp(v.items);
      case "weigh": return weigh(v.left, v.right, v.heavier);
      case "cup": return cup(v.levels);
      case "solid": return solid(v.s);
      case "plane": return plane(v.s);
      case "text": return `<div class="vis-text">${esc(v.t)}</div>`;
      default: return "";
    }
  }
  return { render, esc };
})();

/* ── 朗读：浏览器语音，排除搞怪声音；老师口头读题仍是主要方式 ── */
const Speak = (() => {
  const BAD = /(eddy|grandpa|grandma|flo|reed|rocko|sandy|shelley|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|fred|junior|kathy|ralph)/i;
  function pick() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const zh = vs.filter((v) => /^zh/i.test(v.lang) && !BAD.test(v.name));
    return zh.find((v) => /tingting|ting-ting|meijia|google/i.test(v.name)) || zh[0] || null;
  }
  function say(text) {
    if (!window.speechSynthesis || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN"; u.rate = 0.85;
    const v = pick(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => {};
  return { say };
})();

/* ── 提示音（学生切到别的分页时，靠它把人叫回来） ── */
const Beep = (() => {
  let ctx = null;
  function unlock() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); } catch (e) {} }
  function tone(freq, t0, dur) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
    o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.05);
  }
  function ping() { unlock(); tone(660, 0, 0.18); tone(880, 0.16, 0.18); tone(1175, 0.32, 0.3); }
  function ok() { unlock(); tone(784, 0, 0.12); tone(1047, 0.1, 0.2); }
  function no() { unlock(); tone(523, 0, 0.14); }
  return { unlock, ping, ok, no };
})();

/* ── 名单：只存在老师的浏览器，由老师经课堂频道临时发给学生，不进源码、不存服务器 ── */
const Roster = {
  groups: null,
  set(g) { this.groups = Array.isArray(g) && g.length ? g : null; },
  flat() { return this.groups ? [].concat(...this.groups) : []; },
  name(i) { return this.groups ? (this.flat()[i - 1] || "") : ""; },
  count() { return this.groups ? this.flat().length : 0; },
  startOf(gi) { let n = 0; for (let k = 0; k < gi; k++) n += this.groups[k].length; return n; },
  parse(text) { return text.split(/\n/).map((l) => l.split(/[\s,，、;；]+/).filter(Boolean)).filter((g) => g.length); }
};

/* ── 图标与头像（不用 emoji） ── */
const Icon = {
  speaker: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
  help: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.3a3 3 0 115 2c-1.2.8-2.2 1.3-2.2 2.9"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 8.5V13l3 2M9.5 2.5h5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/></svg>'
};
const AV_COLORS = ["#E8505B","#3B82F6","#22A06B","#B45309","#7C5CE0","#0B7F8A","#C2528B","#5C7A29"];
const AV = { icons: {} };
const AV_ICONS = ["cat","dog","bird","fish","butterfly","horse","cow","rabbit","flower-lotus","leaf","star","heart","moon","sun","rocket","airplane","bicycle","crown","lightning","ice-cream","balloon","sailboat","soccer-ball","cactus","acorn","paw-print","cookie","cloud","tree","planet","ghost","bug"];
function iconColor(key) { const k = AV_ICONS.indexOf(key); return AV_COLORS[(k < 0 ? 0 : k) % AV_COLORS.length]; }
function avatar(i, size) {
  const nm = Roster.name(i), ic = AV.icons[i], s = size || 36;
  if (ic) return `<span class="avc" style="--s:${s}px;background:${iconColor(ic)}"><i class="ph-fill ph-${ic}" style="font-size:${Math.round(s * 0.6)}px"></i></span>`;
  const txt = nm ? nm[0] : String(i);
  return `<span class="avc" style="--s:${s}px;background:#9aa0b3">${Vis.esc(txt)}</span>`;
}

// ===== i18n strings =====
const STRINGS = {
  ja: {
    introGreeting: "おはっぴ～！",
    introBody:
      "手話が大好きで絶賛勉強中✨✨ここは私の学習記録をまとめた場所だよ。教育目的ではないので注意(>_<)",
    levelJSL: "日本手話",
    levelASL: "アメリカ手話",
    searchLabel: "タイトル検索",
    sortLabel: "並び替え",
    sortNewest: "新しい順",
    sortOldest: "古い順",
    sortTitleAZ: "タイトル A→Z",
    sortTitleZA: "タイトル Z→A",
    typeLabel: "種類",
    typeAll: "すべて",
    typeVideo: "動画",
    typeBlog: "ブログ",
    filterLabel: "タグで絞り込み",
    clearFilters: "絞り込みをクリア",
    tagEvent: "アーカイブ",
    tagOther: "その他",
    videosHeading: "動画",
    blogHeading: "ブログ",
    postedOn: "投稿日",
    readMore: "続きを読む",
    footerNote: "何事も楽しく！"
  },
  en: {
    introGreeting: "Hellooo",
    introBody:
      "A hearing person in love with sign language <3 This is a place to keep track of my learning journey. 【Disclaimer】 it’s not for educational purposes (>_<)",
    searchLabel: "Search title",
    sortLabel: "Sort",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortTitleAZ: "Title A→Z",
    sortTitleZA: "Title Z→A",
    typeLabel: "Type",
    typeAll: "All",
    typeVideo: "Videos",
    typeBlog: "Blog",
    filterLabel: "Filter by tags",
    clearFilters: "Clear filters",
    tagEvent: "Archive",
    tagOther: "Other",
    videosHeading: "Videos",
    blogHeading: "Blog",
    postedOn: "Posted",
    readMore: "Read more",
    footerNote: "life is not colorful, life is coloring"
  }
};

const TAG_LABELS = {
  ja: { Archive: "アーカイブ", Other: "その他", ASL: "ASL", JSL: "JSL" },
  en: { Archive: "Archive", Other: "Other", ASL: "ASL", JSL: "JSL" }
};

// ===== ここに直接投稿を書く =====
const videos = [
  {
    id: "v1",
    title: { ja: "【紹介動画】ねぎ手話教室", en: "【PV】Negi Sign Language Class" },
    datePosted: "2025-08-17",
    tags: ["Other"],
    caption: { ja: "手話教室をご紹介します！", en: "Introducing Sign Class in VRChat" },
    src: "https://youtu.be/yLaVVgxtzyg?si=TM4c2DUFxJu6H8GD"
  },
  {
    id: "v2",
    title: { ja: "【限定公開・共有禁止】8/11 「手話技能検定３級」手話検定対策アーカイブ", en: "【DO NOT SHARE】Event Archive, Aug.11 " },
    datePosted: "2025-08-11",
    tags: ["Archive"],
    caption: { ja: "【担当】あやっぴ【クイズ・通訳】ユウ", en: "Host: Ayappii | Quiz/Translator: Yu" },
    src: "https://youtu.be/vBS79jX2jfU"
  },
  {
    id: "v3",
    title: { ja: "【限定公開・共有禁止】8/18 「全国手話検定５級」手話検定対策アーカイブ", en: "【DO NOT SHARE】Event Archive, Aug.18 " },
    datePosted: "2025-08-18",
    tags: ["Archive"],
    caption: { ja: "【担当】エスナ【クイズ】あやっぴ【通訳】ユウ", en: "Host: Esna | Quiz: Ayappii | Translator: Yu" },
    src: "https://youtu.be/Baa4h8p6aHA"
  }
];

const posts = [
  {
  id: "b2",
  title: { ja: "初投稿✨", en: "First Post ✨" },
  datePosted: "2025-08-17",
  tags: ["Other"],
  excerpt: { 
    ja: "自己紹介と運用について。", 
    en: "Nice to meet you!" 
  },
  content: {
    ja: `
<h3>はじめまして！</h3>
<p>なんでも思い立ったらすぐのAyappiiです。VRChatに魅了され、今はどっぷり手話にはまっています(>_<)</p>

<p>ぶいちゃの中で手話べりするのも楽しいけど、何か新しいことを始めたいと思い、急遽サイトを立ち上げてみました！これからの運用については正直未定です。目的はプロフィールに書かれている通り、個人の学習記録のために運用していきます。気が向いたときにブログや動画を投稿していく予定です。</p>

<p>手話はとっても魅力的な言語で、それこそぶいちゃで無言勢の方にはつよーい味方になるんじゃないかな。このサイトは、すでにぶいちゃをやられている方も、そうでない方も、両者に対して、ただただ私の手話愛を語っていく場所です。</p>

<p>マイペースですが、どうぞよろしくお願いします！</p>
    `,
    en: `
<h3>Hello!</h3>
<p>I'm Ayappii, thanks for visiting the page! I've been captivated by VRChat, and right now I'm deeply into sign language ( >_< ).</p>

<p>Having sign talk inside VRC is fun, but I wanted to try something new, leading me to launch this site out of blue haha. Honestly, I don’t yet know how it will be run. As written in my profile, the purpose is to keep a personal learning log. I'll post blogs and videos whenever I feel like it.</p>

<p>Sign language is such a fascinating language, and for the mute users in VRChat, it could be a powerful ally. This site is simply a place for me to share my love for sign language, whether or not you’re already into VRC.</p>

<p>It'll be at my own pace, but I hope you enjoy it!</p>
    `
  }
}
];


// ===== state / helpers =====
const safeLang = (v) => (v === "ja" || v === "en" ? v : "ja");

const state = {
  lang: safeLang(localStorage.getItem("lang") || "ja"),
  query: "",
  sort: "date-desc",
  type: "all",
  tags: new Set()
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmtDate = (d, lang) =>
  new Date(d + "T00:00:00").toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

function compareBy(a, b, key, lang) {
  if (key === "date-desc") return b.datePosted.localeCompare(a.datePosted);
  if (key === "date-asc")  return a.datePosted.localeCompare(b.datePosted);
  const A = (a.title[lang] || "").toLowerCase();
  const B = (b.title[lang] || "").toLowerCase();
  if (key === "title-asc")  return A.localeCompare(B);
  if (key === "title-desc") return B.localeCompare(A);
  return 0;
}

function matchesFilters(item) {
  if (state.type === "video" && !("src" in item))     return false;
  if (state.type === "blog"  && !("excerpt" in item)) return false;
  const t = (item.title[state.lang] || "").toLowerCase();
  if (state.query && !t.includes(state.query.toLowerCase())) return false;
  if (state.tags.size > 0) {
    const hit = item.tags?.some((tg) => state.tags.has(tg));
    if (!hit) return false;
  }
  return true;
}

// ===== youtube helpers =====
const isYouTube = (u) => /youtu\.be|youtube\.com/.test(u || "");
const ytEmbed = (u) => {
  const id = (u.match(/(?:v=|\.be\/)([A-Za-z0-9_-]{6,})/) || [])[1] || "";
  return `https://www.youtube.com/embed/${id}`;
};

// ===== render =====
function renderAll() {
  applyI18n();

  const vWrap = $("#videoList");
  const bWrap = $("#blogList");
  if (!vWrap || !bWrap) {
    console.warn("[renderAll] 必要なコンテナが見つかりません。", {
      hasVideoList: !!vWrap, hasBlogList: !!bWrap
    });
    return;
  }

  const vData = videos.filter(matchesFilters).sort((a,b)=>compareBy(a,b,state.sort,state.lang));
  vWrap.innerHTML = vData.map(renderVideoCard).join("");

  const bData = posts.filter(matchesFilters).sort((a,b)=>compareBy(a,b,state.sort,state.lang));
  bWrap.innerHTML = bData.map(renderBlogCard).join("");

  // fullscreen（ローカル video のみ）
  $$(".video-wrap .fs").forEach((btn) => {
    btn.addEventListener("click", () => {
      const video = btn.closest(".video-wrap").querySelector("video");
      if (video?.requestFullscreen) video.requestFullscreen();
      else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
  });

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function renderVideoCard(v) {
  const posted  = STRINGS[state.lang].postedOn + ": " + fmtDate(v.datePosted, state.lang);
  const tagHtml = (v.tags || []).map((t) => `<span class="chip">${TAG_LABELS[state.lang][t] || t}</span>`).join("");

  // YouTube
  if (isYouTube(v.src)) {
    return `
      <article class="card post" data-type="video">
        <div class="thumb" style="aspect-ratio:16/9; overflow:hidden; border-radius:12px;">
          <iframe src="${esc(ytEmbed(v.src))}" title="${esc(v.title[state.lang])}" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen style="width:100%; height:100%;"></iframe>
        </div>
        <h4>${esc(v.title[state.lang])}</h4>
        <div class="meta"><span>${posted}</span>${tagHtml}</div>
        <p>${esc(v.caption?.[state.lang] || "")}</p>
      </article>
    `;
  }

  // MP4
  return `
    <article class="card post" data-type="video">
      <div class="thumb video-wrap">
        <video controls preload="metadata" ${v.poster ? `poster="${esc(v.poster)}"` : ""}>
          <source src="${esc(v.src)}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button class="fs" aria-label="Fullscreen">⤢</button>
      </div>
      <h4>${esc(v.title[state.lang])}</h4>
      <div class="meta"><span>${posted}</span>${tagHtml}</div>
      <p>${esc(v.caption?.[state.lang] || "")}</p>
    </article>
  `;
}

function renderBlogCard(b) {
  const posted  = STRINGS[state.lang].postedOn + ": " + fmtDate(b.datePosted, state.lang);
  const tagHtml = (b.tags || []).map((t) => `<span class="chip">${TAG_LABELS[state.lang][t] || t}</span>`).join("");

  const title   = esc(b.title[state.lang] || "");
  const excerpt = esc(b.excerpt?.[state.lang] || "");
  // 長文本文（リッチテキスト可。なければ抜粋を使う）
  const content = renderRichText(b.content?.[state.lang] || b.excerpt?.[state.lang] || "");

  const coverImg = b.cover
    ? `<img class="blog-cover" src="${esc(b.cover)}" alt="" loading="lazy">`
    : "";

  return `
    <details class="card blog-accordion" data-type="blog">
      <summary>
        <h4>${title}</h4>
        <div class="meta">
          <span>${posted}</span>
          ${tagHtml}
        </div>
        ${excerpt ? `<p class="excerpt">${excerpt}</p>` : ""}
      </summary>
      <div class="blog-body">
        ${coverImg}
        ${content}
      </div>
    </details>
  `;
}
function sanitize(html){
  const allowed = /^(p|br|strong|em|b|i|u|a|ul|ol|li|h3|h4|blockquote|code|pre)$/i;
  const div = document.createElement('div');
  div.innerHTML = html;

  const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
  const rm = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!allowed.test(el.tagName)) rm.push(el);
    if (el.tagName === 'A') { // aタグは最低限だけ許可
      [...el.attributes].forEach(attr => {
        if (!['href','title','target','rel'].includes(attr.name)) el.removeAttribute(attr.name);
      });
      if (el.getAttribute('href')?.startsWith('javascript:')) el.removeAttribute('href');
      el.setAttribute('target','_blank');
      el.setAttribute('rel','noopener');
    }
  }
  rm.forEach(n => n.replaceWith(...n.childNodes));
  return div.innerHTML;
}

// 改行→段落に変換しつつ、上のsanitizeも通す
function renderRichText(textOrHtml){
  // ユーザーが <p> などを直接書く場合はそのまま、素のテキストなら段落化
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(textOrHtml || "");
  const html = looksHtml
    ? textOrHtml
    : String(textOrHtml || "").split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join("");
  return sanitize(html);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

// ===== i18n apply =====
function applyI18n() {
  if (!STRINGS[state.lang]) {
    console.warn("[i18n] unknown lang:", state.lang, "-> fallback to ja");
    state.lang = "ja";
    localStorage.setItem("lang", "ja");
  }
  const dict = STRINGS[state.lang];
  document.documentElement.lang = state.lang === "ja" ? "ja" : "en";
  $$(".site-header .brand, [data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    if (dict[key] != null) el.textContent = dict[key];
  });
  $$(".tags label").forEach((lab) => {
    const input = lab.querySelector("input"); if (!input) return;
    const span  = lab.querySelector("span");
    span.textContent = (TAG_LABELS[state.lang] && TAG_LABELS[state.lang][input.value]) || input.value;
  });
}

// ===== events =====
function initEvents() {
  const jaBtn = $("#lang-ja");
  const enBtn = $("#lang-en");
  jaBtn && jaBtn.addEventListener("click", () => setLang("ja"));
  enBtn && enBtn.addEventListener("click", () => setLang("en"));

  const search = $("#searchInput");
  search && search.addEventListener("input", (e) => { state.query = e.target.value.trim(); renderAll(); });

  const sortSel = $("#sortSelect");
  sortSel && sortSel.addEventListener("change", (e) => { state.sort = e.target.value; renderAll(); });

  const typeSel = $("#typeSelect");
  typeSel && typeSel.addEventListener("change", (e) => { state.type = e.target.value; renderAll(); });

  $$(".tagChk").forEach((chk) =>
    chk.addEventListener("change", (e) => {
      const { checked, value } = e.target;
      checked ? state.tags.add(value) : state.tags.delete(value);
      renderAll();
    })
  );

  const clr = $("#clearFilters");
  clr && clr.addEventListener("click", () => {
    if (search) search.value = "";
    if (sortSel) sortSel.value = "date-desc";
    if (typeSel) typeSel.value = "all";
    state.query = ""; state.sort = "date-desc"; state.type = "all"; state.tags.clear();
    $$(".tagChk").forEach((c) => (c.checked = false));
    renderAll();
  });
}

function setLang(lang) {
  state.lang = safeLang(lang);
  localStorage.setItem("lang", state.lang);
  const jaBtn = $("#lang-ja"), enBtn = $("#lang-en");
  if (jaBtn && enBtn) {
    jaBtn.classList.toggle("active", state.lang === "ja");
    jaBtn.setAttribute("aria-pressed", String(state.lang === "ja"));
    enBtn.classList.toggle("active", state.lang === "en");
    enBtn.setAttribute("aria-pressed", String(state.lang === "en"));
  }
  renderAll();
}

// ===== init =====
function init() {
  if (!localStorage.getItem("lang")) localStorage.setItem("lang", "ja");
  initEvents();
  renderAll(); // ← 直接描画
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}



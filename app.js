// === Force motion override (ignore OS-level reduced motion) ===
;(function(){
  try{
    window.__FORCE_MOTION__ = true;
    var root = document.documentElement;
    if (!root.classList.contains('force-motion')) {
      root.classList.add('force-motion');
    }
    var old = document.getElementById('force-motion-override');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var st = document.createElement('style');
    st.id = 'force-motion-override';
    st.textContent = [
      '.force-motion [data-fade-slide]{',
      '  opacity:0 !important;',
      '  transform: translateX(-24px) !important;',
      '  transition: transform .6s cubic-bezier(.22,.61,.36,1), opacity .6s ease !important;',
      '  will-change: transform, opacity;',
      '}',

      '.force-motion [data-fade-slide].is-in{',
      '  opacity:1 !important;',
      '  transform:none !important;',
      '}',

      '.force-motion .bio-media.is-in{ transition-delay:.05s !important; }',
      '.force-motion .bio-text.is-in{  transition-delay:.15s !important; }',

      '@media (prefers-reduced-motion: reduce){',
      '  .force-motion [data-fade-slide]{',
      '    opacity:0 !important;',
      '    transform: translateX(-24px) !important;',
      '    transition: transform .6s cubic-bezier(.22,.61,.36,1), opacity .6s ease !important;',
      '  }',
      '  .force-motion [data-fade-slide].is-in{',
      '    opacity:1 !important;',
      '    transform:none !important;',
      '  }',
      '  .force-motion .card.post, .force-motion .blog-accordion{',
      '    transition: transform .18s ease, box-shadow .18s ease !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }catch(e){ /* no-op */ }
})();

// ===== i18n strings =====
const STRINGS = {
  ja: {
    introGreeting: "おはっぴ～！",
    introBody:
      "手話が大好きで絶賛勉強中✨ここは私の学習記録とVRCでの暮らしをまとめた場所だよ。教育目的ではないので注意(>_<)",
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
    galleryHeading: "ギャラリー",
    postedOn: "投稿日",
    readMore: "続きを読む",
    noResults: "該当のものがありません",
    footerNote: "何事も楽しく！",
    languageLabel: "言語：",
    statusLabel: "ステータス：",
    status1: "手話イベント主催中。誰でもおいで！",
    status2: "手話べりしているよ。",
    status3: "そっとしておいてね...!",
  },
  en: {
    introGreeting: "gm!",
    introBody:
      "A hearing person in love with sign language <3 This is a place to keep track of my learning journey. 【Disclaimer】 it’s not for educational purposes!!!",
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
    galleryHeading: "Gallery",
    postedOn: "Posted",
    readMore: "Read more",
    noResults: "No matching items.",
    footerNote: "life is not colorful, life is coloring",
    languageLabel: "Language:",
    statusLabel: "Status:",
    status1: "Hosting JSL event atm- Hop in!!",
    status2: "chilling out",
    status3: "dont mind me, just need little break"
  }
};
STRINGS.ja.prev = "前へ";
STRINGS.ja.next = "次へ";
STRINGS.ja.pageSep = "／";

const TAG_LABELS = {
  ja: { Archive: "アーカイブ", Other: "その他", ASL: "ASL", JSL: "JSL" },
  en: { Archive: "Archive", Other: "Other", ASL: "ASL", JSL: "JSL" }
};

function getGallerySource(){
  if (typeof gallery !== "undefined" && Array.isArray(gallery)) return gallery;
  if (Array.isArray(window.GALLERY)) return window.GALLERY;
  return [];
}

function getPostsSource(){
  if (typeof posts !== "undefined" && Array.isArray(posts)) return posts; // 後方互換
  if (Array.isArray(window.POSTS)) return window.POSTS;
  return [];
}

function getVideosSource(){
  if (typeof videos !== "undefined" && Array.isArray(videos)) return videos;
  if (Array.isArray(window.VIDEOS)) return window.VIDEOS;
  return [];
}


// --- Google Drive URL helpers ---
function toDriveFileId(u){
  if(!u) return "";
  const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/) || u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m && m[1] ? m[1] : "";
}
function buildDriveCandidates(url){
  const id = toDriveFileId(url);
  if(!id) return [url];
  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,   // ←安定
    `https://drive.google.com/uc?export=view&id=${id}`        // ←予備
  ];
}


function uniformShuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}



// --- ギャラリー描画（画像onerrorでフォールバック → ダメなら要素ごと非表示） ---
function renderGallery(){
  const track = document.getElementById("galleryTrack");
  const wrap  = track?.closest(".marquee");
  if(!track || !wrap) return;

  stopMarquee(wrap);

  const seq = makeGallerySequence(getGallerySource());
  if(seq.length === 0){ track.innerHTML = ""; return; }

  track.innerHTML = seq.map((g) => {
    const first = g.candidates[0];
    const alt   = esc(g.alt);
    const href  = g.href || first;
    return `
      <li class="marquee-item">
        <a href="${esc(href)}" target="_blank" rel="noopener">
          <img
            src="${esc(first)}"
            alt="${alt}"
            loading="lazy"
            decoding="async"
            data-fallbacks='${esc(JSON.stringify(g.candidates.slice(1)))}'
          >
        </a>
      </li>`;
  }).join("");

  track.querySelectorAll("img").forEach(img => {
  img.addEventListener("load", () => {
    img.dataset.locked = "1";
    img.removeAttribute("data-fallbacks");
  }, { once:true });

  img.addEventListener("error", () => {
    if (img.dataset.locked === "1") return; 
    try{
      const rest = JSON.parse(img.getAttribute("data-fallbacks") || "[]");
      if(rest.length){
        const next = rest.shift();
        img.setAttribute("data-fallbacks", JSON.stringify(rest));
        img.src = next;
      }else{
        const li = img.closest(".marquee-item");
        if(li){ li.style.display = "none"; }
      }
    }catch(e){
      const li = img.closest(".marquee-item");
      if(li){ li.style.display = "none"; }
    }
  });
});

  startMarquee(track, wrap);
  
  setupGalleryNav(wrap, track);
disableGalleryNavAll();
}

function disableGalleryNavAll(){
  const track = document.getElementById("galleryTrack");
  if(!track) return;

  track.querySelectorAll(".marquee-item a").forEach(a => {
    a.setAttribute("aria-disabled","true");
    a.setAttribute("role","presentation");
    a.setAttribute("tabindex","-1");
    // keep href; clicks are blocked via CSS/JS


    const block = (e) => { e.preventDefault(); e.stopPropagation(); };
    a.addEventListener("click", block, { passive:false });
    a.addEventListener("auxclick", block, { passive:false });  // 中クリック等
    a.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " ") block(e);
    }, { passive:false });
  });
}

const mqMobile = window.matchMedia('(max-width: 520px)');
const PAGE_SIZE_MOBILE  = 2;  // スマホ
const PAGE_SIZE_DESKTOP = 6;  // PC

// ===== state / helpers =====
const safeLang = (v) => (v === "ja" || v === "en" ? v : "ja");

const state = {
  lang: safeLang(localStorage.getItem("lang") || "ja"),
  query: "",
  sort: "date-desc",
  type: "all",
  tags: new Set(),
  isMobile: mqMobile.matches,
  mobilePage: 0,   // モバイル：2件ずつのページ番号
  desktopPage: 0,  // デスクトップ：6件ずつのページ番号
};
// 現在ページの前後と先頭/末尾だけを出す“Google風”のページ番号配列を作る
function buildPageList(count, cur){ // cur: 0-based
  if (count <= 1) return [0];
  const keep = new Set([0, count-1, cur-2, cur-1, cur, cur+1, cur+2]);
  const nums = [...keep].filter(n => n >= 0 && n < count).sort((a,b)=>a-b);
  const out = [];
  let prev = -1;
  for(const n of nums){
    if (prev >= 0 && n - prev > 1) out.push('...');
    out.push(n);
    prev = n;
  }
  return out;
}

(mqMobile.addEventListener ? mqMobile.addEventListener('change', onMQ)
                           : mqMobile.addListener(onMQ));
function onMQ(e){
  state.isMobile = e.matches;
  state.mobilePage = 0; 
  renderAll();
}

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

  const vWrap = document.querySelector("#videoList");
  const bWrap = document.querySelector("#blogList");
  if (!vWrap || !bWrap) return;

  // --- 動画：フィルタ＆ソート（全件）
  const vDataAll = getVideosSource()
    .filter(matchesFilters)
    .sort((a,b)=>compareBy(a,b,state.sort,state.lang));

  const total = vDataAll.length;
  const isM = state.isMobile;
  const perPage = isM ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;

  // 現在ページをクランプ
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  if (isM) {
    state.mobilePage = Math.max(0, Math.min(state.mobilePage, pageCount - 1));
  } else {
    state.desktopPage = Math.max(0, Math.min(state.desktopPage, pageCount - 1));
  }

  // 今ページのスライス
  const curPage = isM ? state.mobilePage : state.desktopPage;
  const start = curPage * perPage;
  const end   = start + perPage;
  const vData = vDataAll.slice(start, end);

  vWrap.innerHTML = vData.length
    ? vData.map(renderVideoCard).join("")
    : `<div class="empty-state" role="status">${esc(STRINGS[state.lang].noResults || "No videos")}</div>`;

  // --- ページャー（モバイル＝前/次＋1/N、PC＝番号タブ＋前/次）
  const pager   = document.querySelector("#videoPager");
  const prevBtn = document.querySelector("#videoPrev");
  const nextBtn = document.querySelector("#videoNext");
  const info    = document.querySelector("#videoPageInfo");
  const nums    = document.querySelector("#videoPageNums");

  const showPager = total > perPage;
  if (pager) pager.hidden = !showPager;

  if (showPager && prevBtn && nextBtn) {
    prevBtn.textContent = STRINGS[state.lang].prev || "Prev";
    nextBtn.textContent = STRINGS[state.lang].next || "Next";

    prevBtn.disabled = curPage <= 0;
    nextBtn.disabled = curPage >= pageCount - 1;

    prevBtn.onclick = () => {
      if (isM) {
        if (state.mobilePage > 0) { state.mobilePage -= 1; renderAll(); }
      } else {
        if (state.desktopPage > 0) { state.desktopPage -= 1; renderAll(); }
      }
    };
    nextBtn.onclick = () => {
      if (isM) {
        if (state.mobilePage < pageCount - 1) { state.mobilePage += 1; renderAll(); }
      } else {
        if (state.desktopPage < pageCount - 1) { state.desktopPage += 1; renderAll(); }
      }
    };
  }

  // モバイル：1 / N 表示
  if (info) {
    const sep = STRINGS[state.lang].pageSep || "/";
    info.textContent = `${curPage + 1}${sep}${pageCount}`;
  }

  // PC：番号タブ（Google風）
  if (!isM && nums) {
    const list = buildPageList(pageCount, curPage);
    nums.innerHTML = list.map(p => {
      if (p === '...') return `<span class="page-ellipsis">…</span>`;
      const cur = (p === curPage) ? ` aria-current="page"` : "";
      return `<button class="page-btn"${cur} data-page="${p}" aria-label="Page ${p+1}">${p + 1}</button>`;
    }).join("");

    nums.querySelectorAll(".page-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = parseInt(btn.getAttribute("data-page"), 10);
        if (!Number.isNaN(p)) {
          state.desktopPage = p;
          renderAll();
        }
      });
    });
  } else if (nums) {
    // モバイルでは番号タブは空に
    nums.innerHTML = "";
  }

  // --- ブログ
  const bData = getPostsSource()
    .filter(matchesFilters)
    .sort((a,b)=>compareBy(a,b,state.sort,state.lang));
  bWrap.innerHTML = bData.length
    ? bData.map(renderBlogCard).join("")
    : `<div class="empty-state" role="status">${esc(STRINGS[state.lang].noResults || "No posts")}</div>`;

  // フルスクリーンボタン（ローカルMP4のみ）
  document.querySelectorAll(".video-wrap .fs").forEach((btn) => {
    btn.addEventListener("click", () => {
      const video = btn.closest(".video-wrap").querySelector("video");
      if (video?.requestFullscreen) video.requestFullscreen();
      else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
  });

  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderGallery();
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
  const content = renderRichText(b.content?.[state.lang] || b.excerpt?.[state.lang] || "");

  const coverCandidates = b.cover ? buildDriveCandidates(b.cover) : null;
  const coverImg = coverCandidates
    ? `<img class="blog-cover" src="${esc(coverCandidates[0])}" alt="" decoding="async" loading="lazy">`
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
  // IMG / FIGURE / 見出しタグも許可
  const allowed = /^(p|br|strong|em|b|i|u|a|ul|ol|li|h1|h2|h3|h4|h5|h6|blockquote|code|pre|img|figure|figcaption)$/i;
  const div = document.createElement('div');
  div.innerHTML = html;

  const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
  const rm = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;

    if (!allowed.test(el.tagName)) rm.push(el);

    if (el.tagName === 'A') {
      [...el.attributes].forEach(attr => {
        if (!['href','title','target','rel'].includes(attr.name)) el.removeAttribute(attr.name);
      });
      if (el.getAttribute('href')?.startsWith('javascript:')) el.removeAttribute('href');
      el.setAttribute('target','_blank');
      el.setAttribute('rel','noopener');
    }

    if (el.tagName === 'IMG') {
      const keep = new Set(['src','alt','loading','decoding','referrerpolicy','draggable','width','height']);
      [...el.attributes].forEach(attr => { if (!keep.has(attr.name)) el.removeAttribute(attr.name); });

      const src = el.getAttribute('src') || '';
      const candidates = (typeof buildDriveCandidates === 'function') ? buildDriveCandidates(src) : [src];
      if (candidates && candidates[0]) el.setAttribute('src', candidates[0]);

      if (!el.getAttribute('loading')) el.setAttribute('loading','lazy');
      el.setAttribute('referrerpolicy','no-referrer');
      el.removeAttribute('onerror'); // インラインJS防止
      el.removeAttribute('style');
    }
  }
  rm.forEach(n => n.replaceWith(...n.childNodes));
  return div.innerHTML;
}


function renderRichText(textOrHtml){
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
  setLang("ja");   
  initEvents();
  renderAll(); // ← 直接描画
  setupBioAnimation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// === Bio: fade & slide in ================================================
let __bioInit = false;
function setupBioAnimation(){
  if(__bioInit) return;
  const root = document.querySelector('.bio-hero');
  if(!root) return;

  const targets = root.querySelectorAll('[data-fade-slide]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  targets.forEach(t => io.observe(t));
  __bioInit = true;
}



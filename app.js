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
  },
  en: {
    introGreeting: "gm!",
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
    galleryHeading: "Gallery",
    postedOn: "Posted",
    readMore: "Read more",
    noResults: "No matching items.",
    footerNote: "life is not colorful, life is coloring"
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

function makeGallerySequence(items, minLen = 24){
  // 1) 正規化（Drive直表示の候補URLを作る）
  const normalized = (items || []).map(it => {
    const href = it.href || it.src || "";
    const candidates = buildDriveCandidates(href); // 先頭: 通常プレビュー / 次: サムネAPI
    return { candidates, href, alt: it.alt || "Photo" };
  }).filter(x => x.candidates && x.candidates[0]);

  // 2) 完全重複の削除（同じ画像URLが多いと偏るため）
  const seen = new Set();
  const uniq = [];
  for (const x of normalized){
    const key = x.candidates[0]; // 同一画像判定は第一候補で
    if (!seen.has(key)){ seen.add(key); uniq.push(x); }
  }
  if (uniq.length === 0) return [];

  // 3) Shuffle-bag を何ラウンドか連結して“均等ランダム”列を作る
  //    ・1ラウンド = 全画像を均等シャッフルで一巡（偏りなし）
  //    ・ラウンド境界で同じ画像が連続しないように先頭を回転
  const rounds = Math.max(2, Math.ceil(minLen / uniq.length) + 1);
  const seq = [];
  let prev = null;

  for (let r = 0; r < rounds; r++){
    let bag = uniformShuffle(uniq);
    if (prev && bag.length > 1 && bag[0].candidates[0] === prev.candidates[0]){
      bag.push(bag.shift()); // 連続を回避
    }
    seq.push(...bag);
    prev = bag[bag.length - 1];
  }

  // 4) 無限ループ境界（先頭と末尾）でも重複しないよう微調整
  if (seq.length > 1 && seq[0].candidates[0] === seq[seq.length - 1].candidates[0]){
    seq.push(seq.shift());
  }

  return seq;
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

// ===== Gallery Marquee: stop current loop if any =====
function stopMarquee(wrap){
  if(!wrap || !wrap.__marquee) return;
  const m = wrap.__marquee;
  cancelAnimationFrame(m.rafId);
  wrap.removeEventListener("mouseenter", m.pause);
  wrap.removeEventListener("mouseleave", m.play);
  wrap.removeEventListener("touchstart", m.pause);
  wrap.removeEventListener("touchend",   m.play);
  document.removeEventListener("visibilitychange", m.onVis);
  delete wrap.__marquee;
}

// --- 無限ループ: 右→左、右から新規が流入。 ---
function startMarquee(track, wrap){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce && !window.__FORCE_MOTION__) return;

  stopMarquee(wrap);

  let offset = 0;
  let lastTs = 0;
  const speed = 25;  // px/sec
  const cs = getComputedStyle(track);
  const gap = parseFloat(cs.gap || cs.columnGap || "12") || 12;

  let paused = false;
  let jumping = false; // ← 連打防止＆アニメ中は停止
  const pause = () => { paused = true;  wrap.classList.add("is-paused"); };
  const play  = () => { paused = false; wrap.classList.remove("is-paused"); };

  wrap.addEventListener("mouseenter", pause);
  wrap.addEventListener("mouseleave", play);
  wrap.addEventListener("touchstart", pause, {passive:true});
  wrap.addEventListener("touchend",   play,  {passive:true});

  const onVis = () => { if(!document.hidden) lastTs = 0; };
  document.addEventListener("visibilitychange", onVis);

  // 足りない幅を複製
  function ensureFilled(track, wrap){
    const need = wrap.clientWidth * 2;
    const snapshot = [...track.children];
    while(track.scrollWidth < need && snapshot.length){
      for(const node of snapshot){
        if(track.scrollWidth >= need) break;
        track.appendChild(node.cloneNode(true));
      }
    }
  }
  ensureFilled(track, wrap);

  // サブピクセル対応で幅を測る
  const wRect = (el)=> el.getBoundingClientRect().width;

  const measureFirstN = (n)=>{
    let distance = 0; const nodes = [];
    let cur = track.firstElementChild;
    for(let i=0;i<n && cur;i++){
      nodes.push(cur);
      distance += wRect(cur) + gap;
      cur = cur.nextElementSibling;
    }
    return { distance, nodes };
  };
  const measureLastN = (n)=>{
    let distance = 0; const nodes = [];
    let cur = track.lastElementChild;
    for(let i=0;i<n && cur;i++){
      nodes.push(cur);
      distance += wRect(cur) + gap;
      cur = cur.previousElementSibling;
    }
    return { distance, nodes };
  };

  function forceReflow(){ void track.offsetWidth; } // layout flush

  function jumpBy(n){
    if(!n || jumping) return;
    jumping = true;
    pause();

    if(n > 0){
      // → 次へ（左へ移動）
      const { distance, nodes } = measureFirstN(n);

      // 現在位置を確定してからアニメ開始
      track.style.transition = 'none';
      track.style.transform  = `translate3d(${offset}px,0,0)`;
      forceReflow();

      track.style.transition = 'transform 300ms ease';
      offset -= distance;
      track.style.transform = `translate3d(${offset}px,0,0)`;

      const done = () => {
        track.removeEventListener('transitionend', done);
        track.style.transition = 'none';
        nodes.forEach(nd => track.appendChild(nd));
        offset += distance;
        track.style.transform = `translate3d(${offset}px,0,0)`;
        forceReflow();
        jumping = false;
        if(!wrap.matches(':hover')) setTimeout(play, 60);
      };
      track.addEventListener('transitionend', done, { once:true });

    }else{
      const cnt = Math.abs(n);
      const { distance, nodes } = measureLastN(cnt);

      nodes.reverse().forEach(nd => track.insertBefore(nd, track.firstElementChild));

      track.style.transition = 'none';
      offset -= distance;
      track.style.transform = `translate3d(${offset}px,0,0)`;
      forceReflow();

      // 右へ戻るアニメ
      track.style.transition = 'transform 300ms ease';
      offset += distance;
      track.style.transform = `translate3d(${offset}px,0,0)`;

      const done = () => {
        track.removeEventListener('transitionend', done);
        track.style.transition = 'none';
        jumping = false;
        if(!wrap.matches(':hover')) setTimeout(play, 60);
      };
      track.addEventListener('transitionend', done, { once:true });
    }
  }

  function step(ts){
    if(!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    if (dt > 1/30) dt = 1/60;
    lastTs = ts;

    if(!paused && !jumping){
      offset -= speed * dt;

      let first = track.firstElementChild;
      while(first){
        const w = first.getBoundingClientRect().width;
        if(-offset >= w + gap){
          offset += w + gap;
          track.appendChild(first);
          first = track.firstElementChild;
        }else break;
      }
      track.style.transform = `translate3d(${offset}px,0,0)`;
    }
    const rafId = requestAnimationFrame(step);
    wrap.__marquee.rafId = rafId;
  }

  wrap.__marquee = { rafId: 0, pause, play, onVis, jump: jumpBy };
  requestAnimationFrame(step);
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
const PAGE_SIZE = 2; // スマホは常に2件だけ表示

// ===== state / helpers =====
const safeLang = (v) => (v === "ja" || v === "en" ? v : "ja");

const state = {
  lang: safeLang(localStorage.getItem("lang") || "ja"),
  query: "",
  sort: "date-desc",
  type: "all",
  tags: new Set(),
  isMobile: mqMobile.matches,
  mobilePage: 0, // ← 今どの“2件セット”を表示しているか（0始まり）
};
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

  // --- スマホは常に2件のみを“ページ送り”で表示、PCは全件
  let vData = vDataAll;
  let pageCount = 1;

  if (state.isMobile) {
    pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

    state.mobilePage = Math.max(0, Math.min(state.mobilePage, pageCount - 1));

    const start = state.mobilePage * PAGE_SIZE;
    const end   = start + PAGE_SIZE;
    vData = vDataAll.slice(start, end);
  }

  vWrap.innerHTML = vData.length
    ? vData.map(renderVideoCard).join("")
    : `<div class="empty-state" role="status">${esc(STRINGS[state.lang].noResults || "No videos")}</div>`;

  // --- スマホ用ページャー（前/次）制御
  const pager   = document.querySelector("#videoPager");
  const prevBtn = document.querySelector("#videoPrev");
  const nextBtn = document.querySelector("#videoNext");
  const info    = document.querySelector("#videoPageInfo");

  if (pager && prevBtn && nextBtn && info) {
    const showPager = state.isMobile && total > PAGE_SIZE;
    pager.hidden = !showPager;

    if (showPager) {
      prevBtn.textContent = STRINGS[state.lang].prev || "Prev";
      nextBtn.textContent = STRINGS[state.lang].next || "Next";
      const sep = STRINGS[state.lang].pageSep || "/";

      info.textContent = `${state.mobilePage + 1}${sep}${pageCount}`;

      prevBtn.disabled = state.mobilePage <= 0;
      nextBtn.disabled = state.mobilePage >= pageCount - 1;

      prevBtn.onclick = () => {
        if (state.mobilePage > 0) {
          state.mobilePage -= 1;
          renderAll();
        }
      };
      nextBtn.onclick = () => {
        if (state.mobilePage < pageCount - 1) {
          state.mobilePage += 1;
          renderAll();
        }
      };
    } else {
      prevBtn.onclick = null;
      nextBtn.onclick = null;
    }
  }

  const bData = getPostsSource()
    .filter(matchesFilters)
    .sort((a,b)=>compareBy(a,b,state.sort,state.lang));
  bWrap.innerHTML = bData.length
    ? bData.map(renderBlogCard).join("")
    : `<div class="empty-state" role="status">${esc(STRINGS[state.lang].noResults || "No posts")}</div>`;

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

  const coverImg = b.cover
    ? `<img class="blog-cover" src="${esc(b.cover)}" alt="" decoding="async">`
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
  if (!localStorage.getItem("lang")) localStorage.setItem("lang", "ja");
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


function setupGalleryNav(wrap, track){
  if(!wrap || !track) return;
  const prev = wrap.querySelector('.marquee-nav.prev');
  const next = wrap.querySelector('.marquee-nav.next');

  // 画像のジャンプ数切替（スマホ, それ以外）
  const getJump = () => (window.matchMedia('(max-width:520px)').matches ? 1 : 1);

  if(prev){
    prev.addEventListener('click', () => {
      wrap.__marquee?.jump?.(-getJump());
    });
  }
  if(next){
    next.addEventListener('click', () => {
      wrap.__marquee?.jump?.( getJump());
    });
  }
}

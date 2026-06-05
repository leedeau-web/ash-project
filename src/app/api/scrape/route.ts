// ASH Project — News Comment Scraper (v2)
// Supports 11 Korean news sites

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BASE: Record<string,string> = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

const JSON_H: Record<string,string> = {
  ...BASE,
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
};

export interface Comment {
  author: string; content: string; likes: number; dislikes: number; date: string;
}
interface SR { title: string; comments: Comment[]; total: number; }

function detectSite(url: string): string {
  if (url.includes('chosun.com'))    return 'chosun';
  if (url.includes('joongang.co.kr') || url.includes('joins.com')) return 'joongang';
  if (url.includes('hani.co.kr'))    return 'hani';
  if (url.includes('khan.co.kr'))    return 'khan';
  if (url.includes('donga.com'))     return 'donga';
  if (url.includes('munhwa.com'))    return 'munhwa';
  if (url.includes('sedaily.com'))   return 'sedaily';
  if (url.includes('seoul.co.kr'))   return 'seoul';
  if (url.includes('mk.co.kr'))      return 'mk';
  if (url.includes('hankyung.com'))  return 'hankyung';
  if (url.includes('ohmynews.com'))       return 'ohmynews';
  if (url.includes('hankookilbo.com'))    return 'hankookilbo';
  return 'unknown';
}

async function fetchHtml(url: string, ref?: string): Promise<string> {
  const res = await fetch(url, {
    headers: { ...BASE, ...(ref ? { Referer: ref } : {}) },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  try { return new TextDecoder('utf-8').decode(buf); }
  catch { return new TextDecoder('euc-kr').decode(buf); }
}

async function fetchJson(url: string, ref?: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { ...JSON_H, ...(ref ? { Referer: ref } : {}) },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Handle JSONP
  const text = await res.text();
  const jsonpMatch = text.match(/^[^(]+\(([\s\S]+)\);?\s*$/);
  if (jsonpMatch) return JSON.parse(jsonpMatch[1]);
  return JSON.parse(text);
}

function getTitle($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('h1').first().text().trim() ||
    $('title').text().split(/[|\-–]/)[0].trim() ||
    '제목 없음'
  );
}

function htmlFallback($: cheerio.CheerioAPI, title: string, listSel: string,
  s: { author: string; content: string; likes: string; date: string }): SR {
  const comments: Comment[] = [];
  $(listSel).each((_, el) => {
    const content = $(el).find(s.content).first().text().trim();
    if (!content || content.length < 2) return;
    comments.push({
      author:   $(el).find(s.author).first().text().trim() || '익명',
      content,
      likes:    parseInt($(el).find(s.likes).first().text().replace(/\D/g,'')) || 0,
      dislikes: 0,
      date:     $(el).find(s.date).first().text().trim(),
    });
  });
  return { title, comments, total: comments.length };
}

// ── 1. 조선일보 ─────────────────────────────────────────────────────────
async function scrapeChosun(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // Arc 기반 기사: Fusion.globalContent._id 에서 슬러그 추출
  let arcId: string | undefined;
  const fusionMatch = html.match(/Fusion\.globalContent=\{"_id":"([^"]+)"/);
  if (fusionMatch) arcId = fusionMatch[1];

  // URL 마지막 세그먼트도 후보 (슬러그 형태)
  if (!arcId) {
    const seg = url.replace(/\/$/, '').split('/').pop();
    if (seg && seg.length > 8) arcId = seg;
  }

  if (arcId) {
    // 기사 날짜 (yyyyMM) 추출
    const dateMatch = html.match(/Fusion\.globalContent=.{0,200}"created_date":"(\d{4}-\d{2})/);
    const artDate = dateMatch ? dateMatch[1].replace('-', '') : new Date().toISOString().slice(0, 7).replace('-', '');

    // 페이지를 반복해서 최대 100개 수집
    const allComments: Comment[] = [];
    let pn = 1;
    while (allComments.length < 100) {
      try {
        const apiUrl = `https://m100.chosun.com/svc/guest/list-api.html?article=${arcId}&arc_story_id=${arcId}&art_site=WWW&ls_act=time&art_date=${artDate}&init_size=3&pn=${pn}&list_type=art&display_type=nickname&size=50&arc_access_token=`;
        const data = await fetchJson(apiUrl, url) as {
          total_comments?: string;
          content_elements?: Array<{
            list_nickname?: string; contents?: string;
            POINT?: number; ARTBBS_DATE?: string;
          }>;
          next?: boolean;
        };
        const list = data?.content_elements ?? [];
        if (!list.length) break;
        for (const c of list) {
          allComments.push({
            author: c.list_nickname ?? '익명',
            content: c.contents ?? '',
            likes: c.POINT ?? 0,
            dislikes: 0,
            date: c.ARTBBS_DATE ?? '',
          });
        }
        if (!data.next) break;
        pn++;
      } catch { break; }
    }

    if (allComments.length > 0) {
      return { title, comments: allComments, total: allComments.length };
    }
  }

  // HTML fallback
  return htmlFallback($, title,
    '.comment-list li, [class*="comment_list"] li, [class*="CommentList"] li',
    { author: '[class*=nick],[class*=author],[class*=Name]', content: '[class*=text],[class*=content],[class*=Text]', likes: '[class*=like],[class*=Like]', date: '[class*=date],[class*=Date],time' }
  );
}

// ── 2. 중앙일보 ─────────────────────────────────────────────────────────
async function scrapeJoongang(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  const idMatch = url.match(/\/article\/(\d+)/) || url.match(/aid=(\d+)/);
  const articleId = idMatch?.[1] || $('meta[name="articleId"]').attr('content');

  if (articleId) {
    try {
      const apiUrl = `https://api.joongang.co.kr/moka_api/comment?cid=${articleId}&domain=joongang.co.kr&section=article&page=1&count=100`;
      const data = await fetchJson(apiUrl, url) as {
        _DATA?: Array<{ CMT_CONTENT?: string; MEM_ID?: string; CMT_LIKE_CNT?: number; CMT_HATE_CNT?: number; REG_DT?: string }>;
      };
      const list = data?._DATA ?? [];
      if (list.length) return {
        title,
        comments: list.map(c => ({ author: c.MEM_ID ?? '익명', content: c.CMT_CONTENT ?? '', likes: c.CMT_LIKE_CNT ?? 0, dislikes: c.CMT_HATE_CNT ?? 0, date: c.REG_DT ?? '' })),
        total: list.length,
      };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '[class*=comment] li', { author: '[class*=nick]', content: '[class*=txt],[class*=content]', likes: '[class*=like]', date: '[class*=date],time' });
}

// ── 3. 한겨레 ────────────────────────────────────────────────────────────
async function scrapeHani(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // Mixon 댓글 시스템 (forum.hani.co.kr) — 2단계
  const idMatch = url.match(/\/(\d+)(?:\.html)?(?:\?|$)/);
  const articleId = idMatch?.[1];

  if (articleId) {
    try {
      const forumHeaders = {
        ...JSON_H,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Origin: 'https://www.hani.co.kr',
        Referer: url,
      };

      // Step 1: post_id 획득
      const ensureRes = await fetch('https://forum.hani.co.kr/hani/boards/news/posts/ensure_article', {
        method: 'POST',
        headers: forumHeaders,
        body: JSON.stringify({ origin_payload: { article_id: Number(articleId), media: 'hankyoreh' } }),
        next: { revalidate: 0 },
      });
      if (!ensureRes.ok) throw new Error(`ensure_article ${ensureRes.status}`);
      const { post_id: postId } = await ensureRes.json() as { post_id?: string };
      if (!postId) throw new Error('post_id not found');

      // Step 2: 댓글 전체 목록 (sidebar = all comments)
      const cRes = await fetch(`https://forum.hani.co.kr/hani/posts/${postId}/comments/embed_sidebar_comments`, {
        headers: { ...JSON_H, Origin: 'https://www.hani.co.kr', Referer: 'https://forum.hani.co.kr/' },
        next: { revalidate: 0 },
      });
      if (!cRes.ok) throw new Error(`comments ${cRes.status}`);
      const $c = cheerio.load(await cRes.text());
      const comments: Comment[] = [];

      $c('li[id^="comment_"]').each((_, el) => {
        const content = $c(el).find('p.break-all').first().text().trim();
        if (!content) return; // 삭제된 댓글 제외
        const bylineSrc = $c(el).find('turbo-frame[src*="/hani/byline/"]').attr('src') ?? '';
        const userMatch = bylineSrc.match(/\/hani\/byline\/([^/?]+)/);
        comments.push({
          author:   userMatch?.[1] ?? '익명',
          content,
          likes:    parseInt($c(el).find('button.comment-recom-btn').first().text().trim()) || 0,
          dislikes: parseInt($c(el).find('button.comment-recom-btn').eq(1).text().trim()) || 0,
          date:     $c(el).find('span.ago-in-words').first().text().trim(),
        });
      });

      if (comments.length > 0) return { title, comments, total: comments.length };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '.comment-list li', { author: '.writer,[class*=nick]', content: '.comment,p', likes: '[class*=like],[class*=good]', date: '.date,[class*=date]' });
}

// ── 4. 경향신문 ─────────────────────────────────────────────────────────
async function scrapeKhan(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // iRevue (griplabs) 댓글 시스템 — 2단계: newsUuid 획득 → 댓글 목록
  const IREVUE_KEY = 'knty3q10-laxufcv3-sy8r4vzp';
  const irevueHeaders = {
    ...JSON_H,
    'x-api-key': IREVUE_KEY,
    Origin: 'https://khan-irevue.griplabs.io',
    Referer: url,
  };

  try {
    // Step 1: newsUuid 획득
    const cleanUrl = url.replace(/\/$/, '');
    const newsRes = await fetch(
      `https://irevue-api.griplabs.io/api/v1/news?url=${encodeURIComponent(cleanUrl)}&title=${encodeURIComponent(title || 'article')}`,
      { headers: irevueHeaders, next: { revalidate: 0 } },
    );
    if (!newsRes.ok) throw new Error(`news API ${newsRes.status}`);
    const newsData = await newsRes.json() as { data?: { newsUuid?: string } };
    const newsUuid = newsData?.data?.newsUuid;
    if (!newsUuid) throw new Error('newsUuid not found');

    // Step 2: 댓글 목록 (페이지당 최대 99개)
    const allComments: Comment[] = [];
    for (let page = 1; page <= 10; page++) {
      const cRes = await fetch(
        `https://irevue-api.griplabs.io/api/v1/comment?targetType=news&targetUuid=${newsUuid}&page=${page}&size=50`,
        { headers: irevueHeaders, next: { revalidate: 0 } },
      );
      if (!cRes.ok) break;
      const cData = await cRes.json() as {
        data?: {
          totalPages?: number;
          elements?: Array<{
            content?: string; nickname?: string;
            reaction?: { like?: number; dislike?: number };
            createdAt?: string;
          }>;
        };
      };
      for (const c of cData?.data?.elements ?? []) {
        if (!c.content?.trim()) continue;
        allComments.push({
          author:   c.nickname ?? '익명',
          content:  c.content,
          likes:    c.reaction?.like ?? 0,
          dislikes: c.reaction?.dislike ?? 0,
          date:     c.createdAt ? c.createdAt.slice(0, 10) : '',
        });
      }
      if (page >= (cData?.data?.totalPages ?? 1)) break;
    }
    if (allComments.length > 0) return { title, comments: allComments, total: allComments.length };
  } catch { /* fallthrough */ }

  return htmlFallback($, title, '.comment_list li', { author: '[class*=nick]', content: '[class*=txt],[class*=content]', likes: '[class*=like]', date: '[class*=date],time' });
}

// ── 5. 동아일보 ─────────────────────────────────────────────────────────
async function scrapeDonga(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // URL 패턴: /YYYYMMDD/{newsId}/ — 날짜(8자리) 다음 숫자가 기사 ID
  const idMatch = url.match(/\/\d{8}\/(\d+)/) || url.match(/\/(\d{9,})/);
  const newsId = idMatch?.[1];

  if (newsId) {
    try {
      const apiUrl = `https://spintop.donga.com/comment?m=listjson&p3=news.donga.com&p4=${newsId}&l=100&p=1&s=date&jsoncallback=cb`;
      const res = await fetch(apiUrl, { headers: { ...JSON_H, Referer: url }, next: { revalidate: 0 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      // JSONP: cb( 'HTML_STRING' ); — 내부 따옴표는 \' 이스케이프
      const markerIdx = text.indexOf("cb(");
      const htmlStart = text.indexOf("'", markerIdx) + 1;
      const htmlEnd = text.lastIndexOf("'");
      if (htmlStart > 0 && htmlEnd > htmlStart) {
        const htmlStr = text.slice(htmlStart, htmlEnd).replace(/\\'/g, "'");
        const $c = cheerio.load(`<ul>${htmlStr}</ul>`);
        const comments: Comment[] = [];
        $c('li').each((_, el) => {
          const content = $c(el).find('.comment').first().text().trim();
          if (!content || content === '삭제된 댓글입니다.') return;
          comments.push({
            author:   $c(el).find('.nicknameArea').first().text().trim() || '익명',
            content,
            likes:    parseInt($c(el).find('[id^="spinTopagree"]').first().text()) || 0,
            dislikes: parseInt($c(el).find('[id^="spinTopdisagree"]').first().text()) || 0,
            date:     $c(el).find('.createdate').first().text().trim(),
          });
        });
        if (comments.length > 0) return { title, comments, total: comments.length };
      }
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '.commentList li', { author: '[class*=nick]', content: '[class*=txt],[class*=content]', likes: '[class*=like],[class*=recommend]', date: '[class*=date],[class*=time]' });
}

// ── 6. 문화일보 ─────────────────────────────────────────────────────────
async function scrapeMunhwa(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // 신 URL: /article/{id} | 구 URL: /news/view.html?no={id}
  const idMatch = url.match(/\/article\/(\d+)/) || url.match(/no=(\w+)/);
  const articleId = idMatch?.[1];

  if (articleId) {
    try {
      const data = await fetchJson(
        `https://dps.munhwa.com/msp_api/comment?cid=${articleId}&domain=www.munhwa.com&section=article&page=1&count=100`,
        url
      ) as {
        _DATA?: Array<{ CMT_CONTENT?: string; MEM_ID?: string; CMT_LIKE_CNT?: number; CMT_HATE_CNT?: number; REG_DT?: string }>;
      };
      const list = data?._DATA ?? [];
      if (list.length) return {
        title,
        comments: list.map(c => ({ author: c.MEM_ID ?? '익명', content: c.CMT_CONTENT ?? '', likes: c.CMT_LIKE_CNT ?? 0, dislikes: c.CMT_HATE_CNT ?? 0, date: c.REG_DT ?? '' })),
        total: list.length,
      };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '#commentArea li, .comment_list li', { author: '[class*=nick],[class*=writer]', content: '[class*=text],[class*=memo]', likes: '[class*=like]', date: '[class*=date]' });
}

// ── 7. 서울경제 ─────────────────────────────────────────────────────────
async function scrapeSedaily(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // URL: /article/{id} | domain 파라미터에 full URL 필요
  const idMatch = url.match(/\/article\/(\d+)/) || url.match(/\/(\d+)(?:\.html)?(?:\?|$)/);
  const articleId = idMatch?.[1];

  if (articleId) {
    try {
      const domain = encodeURIComponent('https://www.sedaily.com');
      const data = await fetchJson(
        `https://dps.sedaily.com/msp_api/comment?cid=${articleId}&domain=${domain}&section=article&page=1&count=100`,
        url
      ) as {
        _DATA?: Array<{ CMT_CONTENT?: string; MEM_ID?: string; CMT_LIKE_CNT?: number; CMT_HATE_CNT?: number; REG_DT?: string }>;
      };
      const list = data?._DATA ?? [];
      if (list.length) return {
        title,
        comments: list.map(c => ({ author: c.MEM_ID ?? '익명', content: c.CMT_CONTENT ?? '', likes: c.CMT_LIKE_CNT ?? 0, dislikes: c.CMT_HATE_CNT ?? 0, date: c.REG_DT ?? '' })),
        total: list.length,
      };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '.comment_list li', { author: '[class*=nick],[class*=name]', content: '[class*=text],[class*=content]', likes: '[class*=like],[class*=good]', date: '[class*=date],time' });
}

// ── 8. 서울신문 ─────────────────────────────────────────────────────────
async function scrapeSeoul(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);
  const idMatch = url.match(/\/(\d+)(?:\.html)?(?:\?|$)/);
  const articleId = idMatch?.[1];
  if (articleId) {
    try {
      const data = await fetchJson(`https://www.seoul.co.kr/comment/list.php?aid=${articleId}&page=1&limit=100`, url) as {
        list?: Array<{ nick?: string; memo?: string; like_cnt?: number; reg_date?: string }>;
      };
      const list = data?.list ?? [];
      if (list.length) return { title, comments: list.map(c => ({ author: c.nick ?? '익명', content: c.memo ?? '', likes: c.like_cnt ?? 0, dislikes: 0, date: c.reg_date ?? '' })), total: list.length };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '#commentList li, .comment_list li', { author: '[class*=nick],[class*=writer]', content: '[class*=text],[class*=memo]', likes: '[class*=like]', date: '[class*=date]' });
}

// ── 9. 매일경제 ─────────────────────────────────────────────────────────
async function scrapeMk(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);
  const idMatch = url.match(/\/(\d{8,})/) || html.match(/'article_id'\s*:\s*(\d+)/);
  const articleId = idMatch?.[1] || $('meta[name="articleId"]').attr('content');
  if (articleId) {
    try {
      const data = await fetchJson(
        `https://dps.mk.co.kr/mk_api/comment?cid=${articleId}&domain=mk.co.kr&section=article&sort=1&page=1&count=100&my=N`,
        url
      ) as {
        _DATA?: Array<{ MEM_ID?: string; CMT_CONTENT?: string; CMT_LIKE_CNT?: number; CMT_HATE_CNT?: number; REG_DT?: string; CMT_STATUS?: string }>;
      };
      const list = (data?._DATA ?? []).filter(c => c.CMT_STATUS === 'A' && c.CMT_CONTENT?.trim());
      if (list.length) return {
        title,
        comments: list.map(c => ({
          author:   c.MEM_ID ?? '익명',
          content:  c.CMT_CONTENT ?? '',
          likes:    c.CMT_LIKE_CNT ?? 0,
          dislikes: c.CMT_HATE_CNT ?? 0,
          date:     c.REG_DT ?? '',
        })),
        total: list.length,
      };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '#cmtListWrap li, .cmt_list li', { author: '[class*=nick],[class*=name]', content: '[class*=txt],[class*=content]', likes: '[class*=like],[class*=good]', date: '[class*=date],time' });
}

// ── 10. 한국경제 ────────────────────────────────────────────────────────
async function scrapeHankyung(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // URL: /article/{pageid} | hkCommentOptions.pageid 에서 추출
  const idMatch = url.match(/\/article\/(\d+)/) || url.match(/\/(\d{10,})/);
  const pageId = idMatch?.[1];

  if (pageId) {
    try {
      const allComments: Comment[] = [];
      for (let p = 1; p <= 10; p++) {
        const data = await fetchJson(
          `https://comment.hankyung.com/api/list?domain=hk&pageid=${pageId}&pagetype=news&commenttype=comment&sort=latest&limit=100&p=${p}`,
          url
        ) as {
          success?: boolean;
          result?: {
            comments?: Array<{ userId?: string; content?: string; likeCount?: number; dislikeCount?: number; insertAt?: string }>;
            isNext?: boolean;
          };
        };
        if (!data?.success) break;
        const list = data.result?.comments ?? [];
        for (const c of list) {
          if (!c.content?.trim()) continue;
          allComments.push({
            author:   c.userId ?? '익명',
            content:  c.content,
            likes:    c.likeCount ?? 0,
            dislikes: c.dislikeCount ?? 0,
            date:     c.insertAt ?? '',
          });
        }
        if (!data.result?.isNext) break;
      }
      if (allComments.length > 0) return { title, comments: allComments, total: allComments.length };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '.comment_list li, [class*=cmt] li', { author: '[class*=nick],[class*=writer]', content: '[class*=txt],[class*=content]', likes: '[class*=like]', date: '[class*=date],time' });
}

// ── 11. 오마이뉴스 ──────────────────────────────────────────────────────
// 댓글 시스템: Livere City (api-zero.livere.com)
async function scrapeOhmynews(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  const cntnCdMatch = url.match(/CNTN_CD=(A\d+)/i) || html.match(/hdnCNTN_CD[^>]*value="(A\d+)"/);
  const cntnCd = cntnCdMatch?.[1];

  if (cntnCd) {
    try {
      // Livere는 article refer URL 기준으로 댓글을 식별
      const refer = `www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=${cntnCd}`;
      const referEnc = encodeURIComponent(refer);
      const sidebarRef = `https://was.livere.me/sidebar/714?uid=NjIzLzE1MjAxLzcxNA%3D%3D&refer=${referEnc}`;

      const allComments: Comment[] = [];
      for (let page = 1; page <= 5; page++) {
        const res = await fetch(
          `https://api-zero.livere.com/v1/comments/list?consumerSeq=623&livereSeq=15201&smartloginSeq=714&refer=${referEnc}&page=${page}&pageSize=50`,
          {
            headers: {
              ...JSON_H,
              'Content-Type': 'application/json',
              Origin: 'https://was.livere.me',
              Referer: sidebarRef,
            },
            next: { revalidate: 0 },
          }
        );
        if (!res.ok) break;
        const data = await res.json() as {
          resultCode?: number;
          results?: {
            comments?: Array<{
              writerName?: string; content?: string; good?: number; bad?: number;
              regdate?: string; deleteYn?: string; blindYn?: string;
            }>;
            hasMore?: boolean;
          };
        };
        if (data.resultCode !== 200) break;
        const list = data.results?.comments ?? [];
        for (const c of list) {
          if (c.deleteYn === 'Y' || c.blindYn === 'Y' || !c.content?.trim()) continue;
          allComments.push({
            author:   c.writerName ?? '익명',
            content:  c.content,
            likes:    c.good ?? 0,
            dislikes: c.bad ?? 0,
            date:     c.regdate ? c.regdate.slice(0, 10) : '',
          });
        }
        if (!data.results?.hasMore || list.length < 50) break;
      }
      if (allComments.length > 0) return { title, comments: allComments, total: allComments.length };
    } catch { /* fallthrough */ }

    // 시리즈 프리미엄 기사: 응원글 AJAX 시도
    try {
      const srsCdMatch = html.match(/hdnSrsCd[^>]*value="([^"]+)"/);
      const srsCd = srsCdMatch?.[1] ?? '';
      const res = await fetch(
        url.includes('series_premium_pg') ? url.replace(/\?.*$/, '') + '?CNTN_CD=' + cntnCd : url,
        {
          method: 'POST',
          headers: { ...BASE, 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', Referer: url },
          body: new URLSearchParams({ reqType: 'ajax', tabType: 'fundingfee', pageNoFee: '1', SRS_CD: srsCd }).toString(),
          next: { revalidate: 0 },
        }
      );
      if (res.ok) {
        const text = await res.text();
        const $c = cheerio.load(text);
        const comments: Comment[] = [];
        $c('li').each((_, el) => {
          const content = $c(el).find('[class*=content],[class*=text],p').first().text().trim();
          if (!content || content.length < 2) return;
          comments.push({
            author: $c(el).find('[class*=nick],[class*=name],[class*=writer]').first().text().trim() || '익명',
            content,
            likes:    parseInt($c(el).find('[class*=like],[class*=good]').first().text().replace(/\D/g, '')) || 0,
            dislikes: 0,
            date:     $c(el).find('[class*=date],time').first().text().trim(),
          });
        });
        if (comments.length > 0) return { title, comments, total: comments.length };
      }
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '#cmtListWrap li, .cmt_wrap li', { author: '[class*=nick],[class*=writer]', content: '[class*=text],[class*=memo]', likes: '[class*=like],[class*=good]', date: '[class*=date]' });
}

// ── 12. 한국일보 ─────────────────────────────────────────────────────────
async function scrapeHankookilbo(url: string): Promise<SR> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const title = getTitle($);

  // URL 패턴: /news/article/A{id} 또는 /View/{id}
  const idMatch = url.match(/\/news\/article\/(A[A-Za-z0-9]+)/) || url.match(/(A\d{15,})/);
  const articleId = idMatch?.[1];

  if (articleId) {
    try {
      const allComments: Comment[] = [];
      let cursorKey: string | null = null;

      for (let page = 1; page <= 10; page++) {
        const params = new URLSearchParams({ articleId, orderBy: 'recently', bestMode: 'false', size: '50' });
        if (cursorKey) params.set('cursorKey', cursorKey);
        const data = await fetchJson(
          `https://www.hankookilbo.com/api/home/articles/article-opinion?${params}`,
          url
        ) as {
          code?: string;
          data?: {
            opinions?: Array<{
              penName?: string; contents?: string; likeCount?: number;
              dislikeCount?: number; createdDt?: string; deleteYn?: string; blindYn?: string;
            }>;
          };
          lastPage?: boolean;
          cursorKey?: string;
        };
        if (data.code !== 'S3000') break;
        for (const c of data.data?.opinions ?? []) {
          if (c.deleteYn === 'Y' || c.blindYn === 'Y' || !c.contents?.trim()) continue;
          allComments.push({
            author:   c.penName ?? '익명',
            content:  c.contents,
            likes:    c.likeCount ?? 0,
            dislikes: c.dislikeCount ?? 0,
            date:     c.createdDt ?? '',
          });
        }
        if (data.lastPage) break;
        cursorKey = data.cursorKey ?? null;
        if (!cursorKey) break;
      }
      if (allComments.length > 0) return { title, comments: allComments, total: allComments.length };
    } catch { /* fallthrough */ }
  }
  return htmlFallback($, title, '[class*=comment] li, [class*=opinion] li', { author: '[class*=nick],[class*=name],[class*=pen]', content: '[class*=content],[class*=text],p', likes: '[class*=like]', date: '[class*=date],time' });
}

// ── Router ───────────────────────────────────────────────────────────────
const SCRAPERS: Record<string, (u: string) => Promise<SR>> = {
  chosun: scrapeChosun, joongang: scrapeJoongang, hani: scrapeHani,
  khan: scrapeKhan, donga: scrapeDonga, munhwa: scrapeMunhwa,
  sedaily: scrapeSedaily, seoul: scrapeSeoul, mk: scrapeMk,
  hankyung: scrapeHankyung, ohmynews: scrapeOhmynews,
  hankookilbo: scrapeHankookilbo,
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url?.trim()) return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    const site = detectSite(url);
    const scraper = SCRAPERS[site];
    if (!scraper) return NextResponse.json({ error: '지원하지 않는 언론사입니다.\n지원: 조선/중앙/한겨레/경향/동아/문화/서울경제/서울신문/매일경제/한국경제/오마이뉴스/한국일보' }, { status: 400 });
    const result = await scraper(url);
    return NextResponse.json({ site, ...result });
  } catch (e) {
    return NextResponse.json({ error: `스크래핑 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}` }, { status: 500 });
  }
}

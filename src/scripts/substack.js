const writing = document.querySelector('[data-site-view="writing"]');
const list = writing.querySelector('.n-writing-list');
const refresh = writing.querySelector('.n-refresh-posts');
const status = writing.querySelector('.n-feed-status');
const dateFormat = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'});
let lastAttempt = 0, busy = false;

function parsePosts(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported feed');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  if (document.querySelector('parsererror') || !document.querySelector('rss')) throw new Error('Invalid feed');
  const seen = new Set();
  const posts = [];
  // Treat RSS fields only as text. Never insert remote HTML into the page.
  const plain = value => new DOMParser().parseFromString(value, 'text/html').body.textContent.trim();
  for (const item of document.querySelectorAll('channel > item')) {
    const field = name => item.querySelector(name)?.textContent.trim() || '';
    const title = plain(field('title')).slice(0, 300);
    let url;
    try {url = new URL(field('link'));} catch {continue;}
    const published = new Date(field('pubDate'));
    if (url.origin !== 'https://nupoorneha.substack.com' || !url.pathname.startsWith('/p/') || url.username || url.password ||
        !title || !Number.isFinite(published.valueOf()) || seen.has(url.href)) continue;
    seen.add(url.href);
    posts.push({title, url:url.href, published, description:plain(field('description')).slice(0,600)});
    if (posts.length >= 100) break;
  }
  if (!posts.length) throw new Error('No public posts');
  return posts;
}

function postRow(post) {
  const row = document.createElement('a');
  row.className = 'n-post-row'; row.dataset.substackPost = ''; row.dataset.postDate = post.published.toISOString();
  row.href = post.url; row.target = '_blank'; row.rel = 'noopener noreferrer';
  const number = document.createElement('span'); number.className = 'n-post-number';
  const copy = document.createElement('span');
  const title = document.createElement('strong'); title.textContent = post.title;
  const description = document.createElement('small'); description.textContent = post.description;
  copy.append(title, description);
  const meta = document.createElement('span'); meta.className = 'n-post-meta';
  const date = document.createElement('time'); date.dateTime = post.published.toISOString(); date.textContent = dateFormat.format(post.published);
  const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
  meta.append(date, ' · Substack ', arrow); row.append(number, copy, meta);
  return row;
}

async function updatePosts(force = false) {
  if (busy || (!force && Date.now() - lastAttempt < 60000)) return;
  busy = true; lastAttempt = Date.now(); refresh.disabled = true; status.textContent = 'Checking Substack…';
  try {
    const response = await fetch('/api/substack.xml', {signal:AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error('Feed unavailable');
    const xml = await response.text();
    if (xml.length > 2 * 1024 * 1024) throw new Error('Feed too large');
    const posts = parsePosts(xml);
    // Retain local elements and their same-window navigation handlers.
    const rows = [...list.querySelectorAll('[data-local-post]'), ...posts.map(postRow)];
    rows.sort((a,b) => Date.parse(b.dataset.postDate) - Date.parse(a.dataset.postDate));
    rows.forEach((row,index) => row.querySelector('.n-post-number').textContent = String(index+1).padStart(2,'0'));
    list.replaceChildren(...rows); status.textContent = 'Up to date.';
  } catch {
    status.textContent = 'Showing saved posts. You can also read on Substack.';
  } finally {busy = false; refresh.disabled = false;}
}

refresh.addEventListener('click', () => updatePosts(true));
window.addEventListener('n3n-view-change', event => {if (event.detail.view === 'writing') updatePosts();});
if (!writing.hidden) updatePosts();

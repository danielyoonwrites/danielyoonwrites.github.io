// Fills in the "Latest posts" list on writing.html with the 4 newest posts from The Shy Korean.
// GitHub runs this just before publishing the site: once a day, and on every merge
// (see .github/workflows/publish.yml). It changes only GitHub's copy of writing.html,
// so the file in the repository keeps its fallback link.
//
// Substack's security blocks GitHub's computers, and Jina Reader refuses visitors' browsers
// without a key, but Jina Reader (r.jina.ai) does pass Substack's data on to GitHub.
// Tested in October 2026.

const fs = require('fs');

// Settings you might want to change
const HOW_MANY_POSTS = 4;
const EXCERPT_WORDS = 30;
const PAGE = 'writing.html';
const START = '<!-- LATEST POSTS START -->';
const END = '<!-- LATEST POSTS END -->';

const ARCHIVE_URL = `https://thingsdandoes.substack.com/api/v1/archive?sort=new&limit=${HOW_MANY_POSTS}`;
const FEED_URL = 'https://thingsdandoes.substack.com/feed';
const JINA = 'https://r.jina.ai/';
// "X-Return-Format: text" asks Jina to pass Substack's data on unchanged
const JINA_HEADERS = { 'X-Return-Format': 'text' };

// Turns things like &amp; and &#8217; back into normal characters
function decodeEntities(text) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

// Makes text safe to put inside HTML
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// The opening of a post: its first paragraphs, cut to about 30 words
function excerpt(html) {
  const withoutImages = (html || '').replace(/<figure[\s\S]*?<\/figure>/g, ''); // skip photos and captions
  const paragraphs = withoutImages.match(/<p[^>]*>[\s\S]*?<\/p>/g) || [];
  let words = [];
  for (const p of paragraphs) {
    if (words.length >= EXCERPT_WORDS) break;
    const text = decodeEntities(p.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (text) words = words.concat(text.split(' '));
  }
  if (words.length === 0) return '';
  return words.length > EXCERPT_WORDS ? words.slice(0, EXCERPT_WORDS).join(' ') + ' …' : words.join(' ');
}

// Dates like "October 24, 2026", in California time
function formatDate(value) {
  const date = new Date(value);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles',
  });
}

// Substack's post list (newest first)
function postsFromArchive(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) return [];
  return data.map((post) => ({
    title: post.title,
    link: post.canonical_url,
    date: post.post_date,
    html: post.body_html || `<p>${escapeHtml(post.truncated_body_text || '')}</p>`,
  }));
}

// Substack's feed
function postsFromFeed(text) {
  const field = (item, tag) => {
    const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return match ? match[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim() : '';
  };
  return (text.match(/<item[\s>][\s\S]*?<\/item>/g) || []).map((item) => ({
    title: decodeEntities(field(item, 'title')),
    link: field(item, 'link'),
    date: field(item, 'pubDate'),
    html: field(item, 'content:encoded'),
  }));
}

const SOURCES = [
  { name: 'Substack post list, through Jina', url: JINA + ARCHIVE_URL, headers: JINA_HEADERS, read: postsFromArchive },
  { name: 'Substack feed, through Jina', url: JINA + FEED_URL, headers: JINA_HEADERS, read: postsFromFeed },
];

async function getPosts() {
  // ARCHIVE_FILE lets you test with a saved copy instead of the real thing
  if (process.env.ARCHIVE_FILE) return postsFromArchive(fs.readFileSync(process.env.ARCHIVE_FILE, 'utf8'));

  for (const source of SOURCES) {
    try {
      const response = await fetch(source.url, { headers: source.headers, signal: AbortSignal.timeout(30000) });
      const text = await response.text();
      console.log(`${source.name}: answered ${response.status}, ${text.length} characters`);
      if (!response.ok) continue;
      const posts = source.read(text);
      if (posts.length > 0) return posts;
      console.log(`${source.name}: no posts found. Start of answer: ${text.slice(0, 300)}`);
    } catch (error) {
      console.log(`${source.name}: ${error.message}`);
    }
  }
  throw new Error('No way worked, so the page keeps its fallback link.');
}

async function main() {
  const posts = (await getPosts()).slice(0, HOW_MANY_POSTS);

  const items = posts
    .map((post) => {
      const link = String(post.link || '').split('?')[0]; // drop tracking codes
      if (!/^https:\/\//.test(link)) return '';
      const lines = excerpt(post.html);
      return `<li class="post">
          <p class="post-date">${escapeHtml(formatDate(post.date))}</p>
          <h3><a href="${escapeHtml(link)}">${escapeHtml(post.title)}</a></h3>
${lines ? `          <p class="post-excerpt">${escapeHtml(lines)}</p>\n` : ''}          <a class="read-link" href="${escapeHtml(link)}">Read on Substack</a>
        </li>`;
    })
    .filter(Boolean);
  if (items.length === 0) throw new Error('The posts had no usable links.');

  const page = fs.readFileSync(PAGE, 'utf8');
  const start = page.indexOf(START);
  const end = page.indexOf(END);
  if (start === -1 || end === -1) throw new Error(`Couldn't find the LATEST POSTS lines in ${PAGE}.`);
  const list = `${START}\n        ${items.join('\n\n        ')}\n        ${END}`;
  fs.writeFileSync(PAGE, page.slice(0, start) + list + page.slice(end + END.length));
  console.log(`Added ${items.length} latest posts to ${PAGE}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

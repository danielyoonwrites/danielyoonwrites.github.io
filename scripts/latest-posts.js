// Fills in the "Latest posts" list on writing.html from the Substack feed.
// GitHub runs this once a day (see .github/workflows/publish.yml), just before publishing the site.
// It changes writing.html only on GitHub's copy, so the file in the repository stays the same.

const fs = require('fs');

// Settings you might want to change
const FEED_URL = 'https://thingsdandoes.substack.com/feed';
const HOW_MANY_POSTS = 4;
const EXCERPT_WORDS = 30;
const PAGE = 'writing.html';
const START = '<!-- LATEST POSTS START -->';
const END = '<!-- LATEST POSTS END -->';

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
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Reads one field, like <title>, from a feed item
function field(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!match) return '';
  return match[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
}

// The first real paragraph of the post, cut to about 30 words
function excerpt(html) {
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/g) || [];
  for (const p of paragraphs) {
    const text = decodeEntities(p.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    const words = text.split(' ');
    if (words.length < 8) continue; // skip captions and short lines
    return words.length > EXCERPT_WORDS ? words.slice(0, EXCERPT_WORDS).join(' ') + ' …' : text;
  }
  return '';
}

// Dates like "October 24, 2026", in California time
function formatDate(pubDate) {
  const date = new Date(pubDate);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles',
  });
}

async function main() {
  // FEED_FILE lets you test with a saved copy of the feed instead of the real one
  const feed = process.env.FEED_FILE
    ? fs.readFileSync(process.env.FEED_FILE, 'utf8')
    : await (await fetch(FEED_URL, { headers: { 'User-Agent': 'danielyoonwrites.github.io latest posts' } })).text();

  const items = (feed.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, HOW_MANY_POSTS);
  if (items.length === 0) throw new Error('No posts found in the feed.');

  const posts = items.map((item) => {
    const title = decodeEntities(field(item, 'title'));
    const link = field(item, 'link').split('?')[0]; // drop tracking codes
    const date = formatDate(field(item, 'pubDate'));
    const lines = excerpt(field(item, 'content:encoded'));
    return `        <li class="post">
          <p class="post-date">${escapeHtml(date)}</p>
          <h3><a href="${escapeHtml(link)}">${escapeHtml(title)}</a></h3>
${lines ? `          <p class="post-excerpt">${escapeHtml(lines)}</p>\n` : ''}          <a class="read-link" href="${escapeHtml(link)}">Read on Substack</a>
        </li>`;
  });

  const list = `${START}
      <ul class="post-list">
${posts.join('\n\n')}
      </ul>
      ${END}`;

  const page = fs.readFileSync(PAGE, 'utf8');
  const start = page.indexOf(START);
  const end = page.indexOf(END);
  if (start === -1 || end === -1) throw new Error(`Couldn't find the LATEST POSTS lines in ${PAGE}.`);
  fs.writeFileSync(PAGE, page.slice(0, start) + list + page.slice(end + END.length));
  console.log(`Added ${posts.length} latest posts to ${PAGE}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

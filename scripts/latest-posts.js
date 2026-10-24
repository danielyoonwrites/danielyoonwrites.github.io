// Loads the 4 newest posts from The Shy Korean into "Latest posts" on writing.html.
// It runs in each visitor's browser when they open the page.
// Substack blocks GitHub's computers, so this can't be done ahead of time.
//
// It tries three ways to read the Substack feed, in order, and uses the first that works.
// If none work, the page keeps its fallback link.
// To see which way worked, open writing.html?debug on your phone.

(function () {
  // Settings you might want to change
  var FEED_URL = 'https://thingsdandoes.substack.com/feed';
  var HOW_MANY_POSTS = 4;
  var EXCERPT_WORDS = 30;
  var WAIT_SECONDS = 8; // how long to wait for each way before trying the next

  var SOURCES = [
    { name: 'Substack feed', url: FEED_URL, type: 'xml' },
    { name: 'AllOrigins relay', url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(FEED_URL), type: 'xml' },
    { name: 'rss2json', url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED_URL), type: 'json' },
  ];

  var list = document.getElementById('latest-posts');
  if (!list) return;
  var debug = /[?&]debug\b/.test(location.search);

  function showDebug(message) {
    if (!debug) return;
    var note = document.createElement('p');
    note.className = 'small-print';
    note.textContent = message;
    list.parentNode.insertBefore(note, list);
  }

  // The first real paragraph of a post, cut to about 30 words
  function excerpt(html) {
    var page = new DOMParser().parseFromString(html || '', 'text/html');
    var paragraphs = page.querySelectorAll('p');
    for (var i = 0; i < paragraphs.length; i++) {
      var text = paragraphs[i].textContent.replace(/\s+/g, ' ').trim();
      var words = text.split(' ');
      if (words.length < 8) continue; // skip captions and short lines
      return words.length > EXCERPT_WORDS ? words.slice(0, EXCERPT_WORDS).join(' ') + ' …' : text;
    }
    return '';
  }

  // Dates like "October 24, 2026"
  function formatDate(value) {
    var date = new Date(String(value).replace(' ', 'T'));
    if (isNaN(date)) date = new Date(value);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // Turns a feed into a simple list of posts
  function postsFromXml(text) {
    var feed = new DOMParser().parseFromString(text, 'application/xml');
    var items = feed.getElementsByTagName('item');
    var posts = [];
    for (var i = 0; i < items.length && posts.length < HOW_MANY_POSTS; i++) {
      var item = items[i];
      var get = function (tag) {
        var el = item.getElementsByTagName(tag)[0];
        return el ? el.textContent.trim() : '';
      };
      var content = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0];
      posts.push({
        title: get('title'),
        link: get('link'),
        date: get('pubDate'),
        html: content ? content.textContent : get('description'),
      });
    }
    return posts;
  }

  function postsFromJson(text) {
    var data = JSON.parse(text);
    return (data.items || []).slice(0, HOW_MANY_POSTS).map(function (item) {
      return { title: item.title, link: item.link, date: item.pubDate, html: item.content || item.description };
    });
  }

  // Builds the same post blocks used in "Start here"
  function show(posts) {
    list.innerHTML = '';
    posts.forEach(function (post) {
      var link = String(post.link || '').split('?')[0]; // drop tracking codes
      if (!/^https:\/\//.test(link)) return;

      var li = document.createElement('li');
      li.className = 'post';

      var date = document.createElement('p');
      date.className = 'post-date';
      date.textContent = formatDate(post.date);
      li.appendChild(date);

      var h3 = document.createElement('h3');
      var titleLink = document.createElement('a');
      titleLink.href = link;
      titleLink.textContent = post.title;
      h3.appendChild(titleLink);
      li.appendChild(h3);

      var lines = excerpt(post.html);
      if (lines) {
        var p = document.createElement('p');
        p.className = 'post-excerpt';
        p.textContent = lines;
        li.appendChild(p);
      }

      var read = document.createElement('a');
      read.className = 'read-link';
      read.href = link;
      read.textContent = 'Read on Substack';
      li.appendChild(read);

      list.appendChild(li);
    });
  }

  function fetchWithTimeout(url) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, WAIT_SECONDS * 1000);
    return fetch(url, { signal: controller.signal }).then(function (response) {
      clearTimeout(timer);
      if (!response.ok) throw new Error('answered ' + response.status);
      return response.text();
    });
  }

  // Try each way in order until one gives us posts
  function trySource(index, failures) {
    if (index >= SOURCES.length) {
      showDebug('Latest posts: no way worked. ' + failures.join(' · '));
      return;
    }
    var source = SOURCES[index];
    fetchWithTimeout(source.url)
      .then(function (text) {
        var posts = source.type === 'json' ? postsFromJson(text) : postsFromXml(text);
        if (posts.length === 0) throw new Error('no posts found');
        show(posts);
        showDebug('Latest posts loaded through: ' + source.name + '.');
      })
      .catch(function (error) {
        failures.push(source.name + ': ' + (error.name === 'AbortError' ? 'took too long' : error.message));
        trySource(index + 1, failures);
      });
  }

  trySource(0, []);
})();

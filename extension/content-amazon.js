chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'COLLECT_AMAZON_SEARCH') return false;
  sendResponse(collectAmazonSearch({
    limit: message.limit || 48,
    includeSignals: Boolean(message.includeSignals)
  }));
  return false;
});

function collectAmazonSearch(options) {
  const cards = Array.from(document.querySelectorAll('[data-component-type="s-search-result"]'))
    .filter((card) => card.querySelector('img.s-image'))
    .slice(0, options.limit);

  return {
    ok: true,
    keyword: getKeyword(),
    sourceUrl: location.href,
    pageTitle: document.title,
    products: cards.map((card, index) => collectProduct(card, index, options))
  };
}

function collectProduct(card, index, options) {
  const image = card.querySelector('img.s-image');
  const title = pickText(card, [
    'h2 a span',
    'h2 span',
    '[data-cy="title-recipe"] span'
  ]);
  const rating = pickText(card, [
    'i.a-icon-star-small span.a-icon-alt',
    'i.a-icon-star span.a-icon-alt',
    '[aria-label*="out of 5 stars"]'
  ]);
  const reviews = pickText(card, [
    'a[href*="customerReviews"] span',
    'span.a-size-base.s-underline-text',
    '[aria-label*="ratings"]'
  ]);
  const price = pickText(card, ['.a-price .a-offscreen']);
  const bought = pickBoughtText(card);
  const sponsored = /sponsored/i.test(card.innerText || '') || Boolean(card.querySelector('[aria-label="Sponsored"]'));
  const rank = Number(card.getAttribute('data-index')) || index + 1;

  return {
    rank,
    asin: card.getAttribute('data-asin') || '',
    image: image?.currentSrc || image?.src || '',
    title,
    rating,
    reviews,
    price,
    bought,
    sponsored,
    signals: options.includeSignals ? collectVisibleSignals(card, { title, rating, reviews, price, bought }) : []
  };
}

function getKeyword() {
  const params = new URLSearchParams(location.search);
  return params.get('k') || document.querySelector('#twotabsearchtextbox')?.value || '';
}

function pickText(root, selectors) {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    const text = cleanText(element?.getAttribute('aria-label') || element?.textContent || '');
    if (text) return text;
  }
  return '';
}

function pickBoughtText(root) {
  for (const line of visibleLines(root)) {
    const text = cleanText(line);
    const english = text.match(/(\d+(?:[,.]\d+)?\s*[Kk]?\+?)\s+(?:bought|sold|purchased)\s+in\s+past\s+month/i);
    if (english) return compactCount(english[1]);

    const chinese = text.match(/(?:\u8fd1\s*30\s*\u5929)?(?:\u9500\u91cf|\u6708\u9500)[^\d]*(\d+(?:[,.]\d+)?\s*[Kk]?\+?)/i)
      || text.match(/(\d+(?:[,.]\d+)?\s*[Kk]?\+?)\s*(?:\u8fd1\s*30\s*\u5929)?(?:\u9500\u91cf|\u6708\u9500)/i);
    if (chinese) return compactCount(chinese[1]);
  }
  return '';
}

function collectVisibleSignals(card, knownValues) {
  const known = new Set(Object.values(knownValues).map(cleanText).filter(Boolean));
  const signalPattern = /(rank|ranking|keyword|volume|bsr|sales|revenue|review|rating|seller|brand|asin|acos|cpc|ctr|cvr|排名|关键词|搜索量|销量|月销|销售额|评论|评分|卖家|品牌|广告|转化|点击)/i;
  const amazonNoise = /(sponsored|prime|add to cart|delivery|ships|climate pledge|limited time deal|more buying choices)/i;
  const signals = [];

  for (const line of visibleLines(card)) {
    if (known.has(line)) continue;
    if (line.length < 3 || line.length > 100) continue;
    if (amazonNoise.test(line)) continue;
    if (!signalPattern.test(line)) continue;
    if (!signals.includes(line)) signals.push(line);
    if (signals.length >= 8) break;
  }

  return signals;
}

function visibleLines(root) {
  return cleanText(root.innerText || '')
    .split(/\n+/)
    .map(cleanText)
    .filter(Boolean);
}

function cleanText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function compactCount(value) {
  return cleanText(value).replace(/\s+/g, '');
}

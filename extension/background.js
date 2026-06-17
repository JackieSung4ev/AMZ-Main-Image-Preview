const STORAGE_KEY = 'gzteamLatestAmazonCapture';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'STORE_CAPTURE') {
    storeCapture(message.payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ ok: false, error: error.message || String(error) }));
    return true;
  }

  if (message?.type === 'GET_LATEST_CAPTURE') {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      sendResponse({ ok: true, payload: result[STORAGE_KEY] || null });
    });
    return true;
  }

  return false;
});

async function storeCapture(payload) {
  const products = Array.isArray(payload?.products) ? payload.products.slice(0, 48) : [];
  const enrichedProducts = await mapWithConcurrency(products, 6, async (product) => {
    const imageDataUrl = await fetchImageAsDataUrl(product.image);
    return imageDataUrl ? { ...product, imageDataUrl } : product;
  });

  const capture = {
    ...payload,
    products: enrichedProducts,
    capturedAt: new Date().toISOString()
  };

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: capture });
    return { ok: true, count: capture.products.length, embeddedImages: countEmbeddedImages(capture) };
  } catch (error) {
    const compactCapture = {
      ...capture,
      products: capture.products.map(({ imageDataUrl, ...product }) => product)
    };
    await chrome.storage.local.set({ [STORAGE_KEY]: compactCapture });
    return {
      ok: true,
      count: compactCapture.products.length,
      embeddedImages: 0,
      warning: 'Image data was too large for extension storage; preview will use image URLs instead.'
    };
  }
}

function countEmbeddedImages(capture) {
  return capture.products.filter((product) => product.imageDataUrl).length;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function fetchImageAsDataUrl(url) {
  if (!url || url.startsWith('data:')) return url || '';
  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) return '';
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    return `data:${contentType};base64,${arrayBufferToBase64(buffer)}`;
  } catch (error) {
    return '';
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

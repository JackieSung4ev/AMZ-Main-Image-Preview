const PREVIEW_URL = 'https://preview-amz.sudob.com/?gzteamCapture=latest';

document.querySelector('#capture').addEventListener('click', async () => {
  const button = document.querySelector('#capture');
  const status = document.querySelector('#status');
  const limit = Number(document.querySelector('#limit').value) || 48;
  const includeSignals = document.querySelector('#includeSignals').checked;

  button.disabled = true;
  status.textContent = '正在读取当前 Amazon 页面...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/amazon\./i.test(tab.url || '')) {
      throw new Error('请先切到 Amazon 搜索结果页再采集。');
    }

    const capture = await collectFromTab(tab.id, { limit, includeSignals });

    if (!capture?.ok || !capture.products?.length) {
      throw new Error('没有在当前页找到搜索结果商品。');
    }

    status.textContent = `已找到 ${capture.products.length} 个商品，正在处理图片...`;
    const stored = await chrome.runtime.sendMessage({
      type: 'STORE_CAPTURE',
      payload: capture
    });

    if (!stored?.ok) throw new Error(stored?.error || '采集结果保存失败。');

    status.textContent = `已采集 ${stored.count} 个商品，正在打开预览...`;
    await chrome.tabs.create({ url: PREVIEW_URL });
    window.close();
  } catch (error) {
    status.textContent = error.message || String(error);
    button.disabled = false;
  }
});

async function collectFromTab(tabId, options) {
  try {
    return await chrome.tabs.sendMessage(tabId, {
      type: 'COLLECT_AMAZON_SEARCH',
      ...options
    });
  } catch (error) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-amazon.js']
    });
    return await chrome.tabs.sendMessage(tabId, {
      type: 'COLLECT_AMAZON_SEARCH',
      ...options
    });
  }
}

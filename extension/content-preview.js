chrome.runtime.sendMessage({ type: 'GET_LATEST_CAPTURE' }, (response) => {
  if (!response?.ok || !response.payload) return;
  let attempts = 0;
  const sendImport = () => {
    attempts += 1;
    window.postMessage({
      source: 'gzteam-amz-extension',
      type: 'GZTEAM_IMPORT_PRODUCTS',
      payload: response.payload
    }, window.location.origin);
    if (attempts < 10) window.setTimeout(sendImport, 500);
  };
  sendImport();
});

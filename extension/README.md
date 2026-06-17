# GZteam Amazon Live Capture Extension

Chrome extension for sending the current Amazon search-result page into GZteam AMZ Main Image Preview.

## Install Locally

1. Open Chrome.
2. Go to `chrome://extensions/`.
3. Turn on `Developer mode`.
4. Click `Load unpacked`.
5. Select this `extension` folder.

## Use

1. Open an Amazon search-result page, for example `https://www.amazon.com/s?k=mylar+bag`.
2. Click the GZteam extension icon.
3. Choose 36 or 48 products.
4. Click `采集并打开预览`.
5. The preview site opens and replaces the competitor images with the captured products.

## What It Can Collect

- Product main image
- Organic position on the current page
- ASIN
- Title
- Rating
- Review count
- Price
- Bought/sales text when visible
- Sponsored flag when visible
- Extra visible DOM text that looks like ranking, keyword, sales, review, seller, ad, ACOS, CPC, CTR, or CVR data

Other browser-extension data can be collected only when that extension renders the text into the Amazon page DOM. This extension cannot read another extension's private storage, background requests, closed shadow DOM, or cross-origin iframe contents.

## Notes

The extension tries to convert captured Amazon images to data URLs before sending them to the preview app. This improves standalone HTML export reliability. If Chrome storage quota is exceeded, it falls back to normal image URLs.

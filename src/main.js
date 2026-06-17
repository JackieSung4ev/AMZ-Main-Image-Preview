import { createApp } from 'vue/dist/vue.esm-bundler.js';
import './styles.css';

const FALLBACK_COMPETITOR_IMAGES = [
  'assets/scraped_B081DLDS6M.jpg',
  'assets/scraped_B07T9CYHDD.jpg',
  'assets/scraped_B0BHQSFZ4Y.jpg',
  'assets/scraped_B0BHYHKYBR.jpg',
  'assets/scraped_B01M7Z22N9.jpg',
  'assets/scraped_B0CMSYFLLJ.jpg',
  'assets/scraped_B08HGVFYP5.jpg',
  'assets/scraped_B0B1ZL421W.jpg',
  'assets/scraped_B08SRSWFY6.jpg',
  'assets/scraped_B0CQY51958.jpg',
  'assets/scraped_B095WKDVH4.jpg',
  'assets/scraped_B07TDDTBCJ.jpg',
  'assets/scraped_B0C5LQ99X5.jpg',
  'assets/scraped_B08QVHZX4B.jpg',
  'assets/scraped_B0CNRWJDCB.jpg',
  'assets/scraped_B0874SDYZ3.jpg',
  'assets/scraped_B07TBDT886.jpg',
  'assets/scraped_B0CKY4DC52.jpg',
  'assets/scraped_B09WH7DPSD.jpg',
  'assets/scraped_B08N6D6BVC.jpg',
  'assets/scraped_B0CT2NBVGD.jpg',
  'assets/scraped_B08D3MKWSX.jpg',
  'assets/scraped_B09CMDKZ3Q.jpg',
  'assets/scraped_B0BLZ9SSV7.jpg',
  'assets/scraped_B0G2QWQPP7.jpg',
  'assets/scraped_B0F65PB9X6.jpg',
  'assets/scraped_B0CNRVCBX4.jpg',
  'assets/scraped_B0DPNXCMVG.jpg',
  'assets/scraped_B0DW93WQC9.jpg',
  'assets/scraped_B01GJ5PIEW.jpg',
  'assets/scraped_B0DK91XMYV.jpg',
  'assets/scraped_B082KQZRQJ.jpg',
  'assets/scraped_B0D2VTH9Y8.jpg',
  'assets/scraped_B0DQTBMNFS.jpg',
  'assets/scraped_B0G8F6TYBV.jpg',
  'assets/scraped_B07RC84B75.jpg',
  'assets/scraped_B0F965HSRG.jpg',
  'assets/scraped_B0DGXW2X7X.jpg',
  'assets/scraped_B0DJQGPMMC.jpg',
  'assets/scraped_B0CLRT5DTF.jpg',
  'assets/scraped_B09TSGW2TN.jpg',
  'assets/scraped_B0GTGRYPS7.jpg',
  'assets/scraped_B0D2RZPWJ5.jpg',
  'assets/scraped_B08FY1NV8R.jpg',
  'assets/scraped_B0F4R7DLR7.jpg',
  'assets/scraped_B08ZXRZK27.jpg',
  'assets/scraped_B0BTHKLK41.jpg'
];

const PLACEHOLDER_TITLES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit'
];

const App = {
  data() {
    return {
      mainImage: 'assets/pouch_main.jpg',
      competitors: FALLBACK_COMPETITOR_IMAGES.slice(),
      baseCompetitors: FALLBACK_COMPETITOR_IMAGES.slice(),
      defaultCompetitors: FALLBACK_COMPETITOR_IMAGES.slice(),
      competitorCategories: [],
      selectedCategoryId: '',
      view: 'pc',
      zoom: 100,
      count: 36,
      myIndex: 0,
      shuffleOffset: 0,
      markMine: false,
      query: 'food pouch bag',
      customCompetitors: false,
      mainDragActive: false,
      competitorDragActive: false,
      exporting: '',
      phoneTime: '09:41',
      placeholderTitles: PLACEHOLDER_TITLES
    };
  },
  computed: {
    cards() {
      const cards = [];
      const competitors = this.competitors.length ? this.competitors : FALLBACK_COMPETITOR_IMAGES;
      let competitorCursor = this.shuffleOffset;

      for (let index = 0; index < this.count; index += 1) {
        if (index === this.myIndex) {
          cards.push(this.makeProduct(index, this.mainImage, true));
        } else {
          const image = competitors[competitorCursor % competitors.length];
          cards.push(this.makeProduct(index, image, false));
          competitorCursor += 1;
        }
      }

      return cards;
    },
    brandImages() {
      const competitors = this.competitors.length ? this.competitors : FALLBACK_COMPETITOR_IMAGES;
      return [0, 1, 2].map((index) => competitors[(this.shuffleOffset + index) % competitors.length]);
    },
    pageStyle() {
      return { transform: `scale(${this.zoom / 100})` };
    },
    metaText() {
      return `${this.count} 个商品 · 第 ${this.myIndex + 1} 位`;
    },
    competitorCountText() {
      return `当前 ${this.competitors.length} 张竞品图`;
    }
  },
  mounted() {
    this.initializeCompetitors();
    this.updatePhoneClock();
    setInterval(this.updatePhoneClock, 60000);
  },
  watch: {
    count(value) {
      if (this.myIndex >= value) this.myIndex = value - 1;
    }
  },
  methods: {
    async initializeCompetitors() {
      await this.loadScrapedCompetitors();
      await this.loadCompetitorCategories();
    },
    async loadScrapedCompetitors() {
      try {
        const response = await fetch('assets/scraped_products.json');
        if (!response.ok) return;
        const products = await response.json();
        const images = products
          .filter((product) => product && product.image && !product.isMyProduct)
          .map((product) => product.image);
        this.baseCompetitors = this.uniqueImages(images.concat(FALLBACK_COMPETITOR_IMAGES));
        this.defaultCompetitors = this.baseCompetitors.slice();
        if (!this.customCompetitors) this.competitors = this.defaultCompetitors.slice();
      } catch (error) {
        this.baseCompetitors = FALLBACK_COMPETITOR_IMAGES.slice();
        this.defaultCompetitors = this.baseCompetitors.slice();
        if (!this.customCompetitors) this.competitors = this.defaultCompetitors.slice();
      }
    },
    async loadCompetitorCategories() {
      try {
        const response = await fetch('competitors/categories.json');
        if (!response.ok) return;
        const data = await response.json();
        const categories = Array.isArray(data.categories) ? data.categories : [];
        this.competitorCategories = categories
          .map((category) => this.normalizeCompetitorCategory(category))
          .filter((category) => category.id && category.images.length);

        if (!this.customCompetitors && this.competitorCategories.length) {
          this.selectedCategoryId = this.competitorCategories[0].id;
          this.applySelectedCategory();
        }
      } catch (error) {
        this.competitorCategories = [];
      }
    },
    normalizeCompetitorCategory(category) {
      const basePath = (category.path || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
      const directImages = Array.isArray(category.images) ? category.images : [];
      const fileImages = Array.isArray(category.files) && basePath
        ? category.files.map((file) => `${basePath}/${file}`)
        : [];

      return {
        id: String(category.id || '').trim(),
        name: String(category.name || category.id || '').trim(),
        keyword: String(category.keyword || '').trim(),
        images: this.uniqueImages(directImages.concat(fileImages).map((path) => this.normalizeImagePath(path)).filter(Boolean))
      };
    },
    normalizeImagePath(path) {
      return String(path || '').replace(/\\/g, '/').replace(/^\.?\//, '');
    },
    applySelectedCategory() {
      if (this.selectedCategoryId === 'custom') return;

      if (!this.selectedCategoryId) {
        this.defaultCompetitors = this.baseCompetitors.slice();
        this.competitors = this.defaultCompetitors.slice();
        this.customCompetitors = false;
        this.shuffleOffset = 0;
        return;
      }

      const category = this.competitorCategories.find((item) => item.id === this.selectedCategoryId);
      if (!category || !category.images.length) return;

      this.defaultCompetitors = category.images.slice();
      this.competitors = category.images.slice();
      this.customCompetitors = false;
      this.shuffleOffset = 0;
      if (category.keyword) this.query = category.keyword;
    },
    makeProduct(index, image, isMine) {
      const titleIndex = index % PLACEHOLDER_TITLES.length;
      const priceWhole = ['6', '8', '9', '10', '12', '15', '19', '24'][index % 8];
      const priceFraction = ['99', '49', '95', '80'][index % 4];
      const reviewCounts = ['128', '463', '1,042', '2,318', '4,906', '8,112'];
      return {
        id: `${isMine ? 'mine' : 'competitor'}-${index}`,
        isMine,
        image,
        title: PLACEHOLDER_TITLES[isMine ? 0 : titleIndex],
        rating: (4.3 + (index % 5) * 0.1).toFixed(1),
        reviews: reviewCounts[index % reviewCounts.length],
        priceWhole: isMine ? '19' : priceWhole,
        priceFraction: isMine ? '99' : priceFraction,
        bought: ['100+', '300+', '500+', '1K+', '2K+'][index % 5],
        sponsored: index % 3 === 0
      };
    },
    async handleMainFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      await this.applyMainFile(file);
      event.target.value = '';
    },
    openMainFilePicker(event) {
      if (event?.target?.closest?.('button,input')) return;
      this.$refs.mainFileInput?.click();
    },
    async handleMainDrop(event) {
      this.mainDragActive = false;
      const files = await this.collectDroppedImageFiles(event.dataTransfer);
      const imageFile = this.sortImageFiles(files.filter(this.isImageFile))[0];
      if (!imageFile) return;
      await this.applyMainFile(imageFile);
    },
    handleMainDragLeave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.mainDragActive = false;
      }
    },
    async applyMainFile(file) {
      if (!this.isImageFile(file)) return;
      this.mainImage = await this.readFileAsDataUrl(file);
    },
    async handleCompetitorFiles(event) {
      await this.applyCompetitorFiles(Array.from(event.target.files || []));
      event.target.value = '';
    },
    openCompetitorFilePicker(event) {
      if (event?.target?.closest?.('button,input')) return;
      this.$refs.competitorFileInput?.click();
    },
    openCompetitorFolderPicker() {
      this.$refs.competitorFolderInput?.click();
    },
    async handleCompetitorDrop(event) {
      this.competitorDragActive = false;
      const files = await this.collectDroppedImageFiles(event.dataTransfer);
      await this.applyCompetitorFiles(files);
    },
    handleCompetitorDragLeave(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.competitorDragActive = false;
      }
    },
    async applyCompetitorFiles(files) {
      const imageFiles = this.sortImageFiles(files.filter(this.isImageFile));
      if (!imageFiles.length) return;
      this.exporting = '正在读取竞品图片...';
      await this.waitForFrame();
      try {
        this.competitors = await Promise.all(imageFiles.map(this.readFileAsDataUrl));
        this.customCompetitors = true;
        this.selectedCategoryId = 'custom';
        this.shuffleOffset = 0;
      } finally {
        this.exporting = '';
      }
    },
    async collectDroppedImageFiles(dataTransfer) {
      const items = Array.from(dataTransfer?.items || []);
      const entries = items
        .map((item) => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
        .filter(Boolean);

      if (entries.length) {
        const nestedFiles = await Promise.all(entries.map((entry) => this.readEntryFiles(entry)));
        return nestedFiles.flat();
      }

      return Array.from(dataTransfer?.files || []);
    },
    readEntryFiles(entry) {
      if (!entry) return Promise.resolve([]);
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file) => resolve(this.isImageFile(file) ? [file] : []), () => resolve([]));
        });
      }

      if (!entry.isDirectory) return Promise.resolve([]);

      const reader = entry.createReader();
      const entries = [];
      return new Promise((resolve) => {
        const readBatch = () => {
          reader.readEntries(async (batch) => {
            if (!batch.length) {
              const nestedFiles = await Promise.all(entries.map((child) => this.readEntryFiles(child)));
              resolve(nestedFiles.flat());
              return;
            }
            entries.push(...batch);
            readBatch();
          }, () => resolve([]));
        };
        readBatch();
      });
    },
    isImageFile(file) {
      if (!file) return false;
      return file.type.startsWith('image/') || /\.(avif|bmp|gif|jpe?g|png|webp)$/i.test(file.name || '');
    },
    sortImageFiles(files) {
      return files.slice().sort((a, b) => {
        const left = a.webkitRelativePath || a.name || '';
        const right = b.webkitRelativePath || b.name || '';
        return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
      });
    },
    resetCompetitors() {
      this.selectedCategoryId = '';
      this.defaultCompetitors = this.baseCompetitors.slice();
      this.competitors = this.defaultCompetitors.slice();
      this.customCompetitors = false;
      this.shuffleOffset = 0;
    },
    shuffleCompetitors() {
      const competitorCount = Math.max(this.competitors.length, FALLBACK_COMPETITOR_IMAGES.length);
      this.shuffleOffset = (this.shuffleOffset + 7) % competitorCount;
    },
    setView(view) {
      this.view = view;
      if (view === 'mobile' && this.zoom > 100) this.zoom = 100;
    },
    updatePhoneClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.phoneTime = `${hours}:${minutes}`;
    },
    nextDeliveryLabel() {
      return 'Saturday, Jun 20';
    },
    async exportPng(mode) {
      if (!window.html2canvas) {
        alert('PNG 导出组件未加载成功。请确认网络可访问 html2canvas CDN。');
        return;
      }

      const target = mode === 'pc'
        ? this.$refs.pcPage
        : mode === 'mobile'
          ? this.$refs.mobileShell
          : this.$refs.previewRoot;

      this.exporting = '正在生成 PNG...';
      await this.waitForFrame();
      try {
        const canvas = await html2canvas(target, {
          backgroundColor: mode === 'mobile' ? '#eef1f4' : '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        this.downloadUrl(canvas.toDataURL('image/png'), `gzteam-main-image-${mode}-${this.dateStamp()}.png`);
      } catch (error) {
        alert('导出失败，请检查图片是否加载完成。');
      } finally {
        this.exporting = '';
      }
    },
    async exportHtml() {
      this.exporting = '正在生成 HTML 单页...';
      await this.waitForFrame();

      try {
        await Promise.all([
          this.waitForImages(this.$refs.pcPage),
          this.waitForImages(this.$refs.mobileShell)
        ]);
        const pcClone = this.$refs.pcPage.cloneNode(true);
        const mobileClone = this.$refs.mobileShell.cloneNode(true);
        await this.inlineCloneImages(this.$refs.pcPage, pcClone);
        await this.inlineCloneImages(this.$refs.mobileShell, mobileClone);

        const css = await this.collectCss();
        const html = this.buildStandaloneHtml(pcClone.outerHTML, mobileClone.outerHTML, css);
        this.downloadBlob(html, `gzteam-amazon-main-image-preview-${this.dateStamp()}.html`, 'text/html;charset=utf-8');
      } catch (error) {
        alert('HTML 导出失败，请确认图片已经加载完成后再试。');
      } finally {
        this.exporting = '';
      }
    },
    buildStandaloneHtml(pcHtml, mobileHtml, css) {
      return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GZteam Amazon Main Image Preview</title>
  <style>
${css}
body {
  display: block;
  min-height: 100vh;
  margin: 0;
  overflow: auto;
  background: #ffffff;
}
.export-toolbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 62px;
  padding: 10px 18px;
  color: #ffffff;
  background: #101820;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.export-brand {
  justify-self: start;
  font-size: 20px;
  font-weight: 800;
}
.export-tabs {
  justify-self: center;
  display: inline-flex;
  gap: 6px;
  padding: 5px;
  background: #1b2836;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
}
.export-tabs button {
  min-width: 116px;
  min-height: 38px;
  padding: 0 18px;
  color: #ffffff;
  background: transparent;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}
.export-tabs button.active {
  color: #101820;
  background: #ffd814;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
}
.export-stage {
  min-height: calc(100vh - 62px);
  background: #ffffff;
}
.export-stage[data-active="mobile"] {
  background: #eef1f4;
}
.export-stage[data-active="pc"] [data-panel="mobile"],
.export-stage[data-active="mobile"] [data-panel="pc"] {
  display: none;
}
.export-pc-panel {
  width: 100%;
  overflow-x: auto;
  background: #ffffff;
}
.export-pc-frame {
  width: 100%;
  min-width: 1780px;
  background: #ffffff;
}
.export-pc-panel .pc-page {
  width: 100%;
  min-width: 1780px;
  margin: 0;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.export-pc-panel .pc-resultbar,
.export-pc-panel .pc-layout {
  width: 1780px;
  margin-right: auto;
  margin-left: auto;
}
.export-mobile-panel {
  min-height: calc(100vh - 62px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 28px;
  background: #eef1f4;
}
@media (max-width: 640px) {
  .export-toolbar {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .export-brand {
    justify-self: center;
  }
}
  </style>
</head>
<body>
  <nav class="export-toolbar">
    <div class="export-brand">GZteam</div>
    <div class="export-tabs">
      <button class="active" type="button" data-switch="pc">PC 端</button>
      <button type="button" data-switch="mobile">手机端</button>
    </div>
  </nav>
  <main class="export-stage" data-active="pc">
    <section class="export-pc-panel" data-panel="pc"><div class="export-pc-frame">${pcHtml}</div></section>
    <section class="export-mobile-panel" data-panel="mobile">${mobileHtml}</section>
  </main>
  <script>
    const stage = document.querySelector('.export-stage');
    const buttons = Array.from(document.querySelectorAll('[data-switch]'));
    const setActive = (mode) => {
      stage.dataset.active = mode;
      buttons.forEach((button) => {
        const isActive = button.dataset.switch === mode;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    };
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        setActive(button.dataset.switch);
      });
    });
    setActive(stage.dataset.active || 'pc');
  <\/script>
</body>
</html>`;
    },
    async inlineCloneImages(sourceRoot, cloneRoot) {
      const sourceImages = Array.from(sourceRoot.querySelectorAll('img'));
      const clonedImages = Array.from(cloneRoot.querySelectorAll('img'));
      for (let index = 0; index < clonedImages.length; index += 1) {
        const dataUrl = await this.imageElementToDataUrl(sourceImages[index]);
        if (dataUrl) clonedImages[index].src = dataUrl;
        clonedImages[index].removeAttribute('srcset');
        clonedImages[index].removeAttribute('loading');
      }
    },
    async imageElementToDataUrl(image) {
      if (!image) return '';
      const src = image.currentSrc || image.src || image.getAttribute('src') || '';
      if (!src) return '';
      if (src.startsWith('data:')) return src;

      if (image.complete && image.naturalWidth && image.naturalHeight) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          return canvas.toDataURL('image/png');
        } catch (error) {
          return await this.imageSrcToDataUrl(src);
        }
      }

      return await this.imageSrcToDataUrl(src);
    },
    async imageSrcToDataUrl(src) {
      if (!src) return '';
      if (src.startsWith('data:')) return src;
      try {
        const response = await fetch(new URL(src, document.baseURI).href, { cache: 'force-cache' });
        if (!response.ok) return src;
        const blob = await response.blob();
        return await this.blobToDataUrl(blob);
      } catch (error) {
        return src;
      }
    },
    async collectCss() {
      const chunks = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          chunks.push(Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n'));
        } catch (error) {
          if (sheet.href) {
            const response = await fetch(sheet.href);
            if (response.ok) chunks.push(await response.text());
          }
        }
      }
      return chunks.join('\n');
    },
    readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },
    blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    },
    uniqueImages(images) {
      return Array.from(new Set(images.filter(Boolean)));
    },
    waitForFrame() {
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    },
    waitForImages(root) {
      const images = Array.from(root.querySelectorAll('img'));
      return Promise.all(images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          const done = () => resolve();
          const timer = setTimeout(done, 2500);
          image.addEventListener('load', () => {
            clearTimeout(timer);
            done();
          }, { once: true });
          image.addEventListener('error', () => {
            clearTimeout(timer);
            done();
          }, { once: true });
        });
      }));
    },
    downloadUrl(url, fileName) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    },
    downloadBlob(content, fileName, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      this.downloadUrl(url, fileName);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    dateStamp() {
      return new Date().toISOString().slice(0, 10);
    }
  },
  template: `
    <div class="app-shell">
      <aside class="control-panel">
        <h1 class="app-title">
          <strong>主图竞品效果图</strong>
          <span>PC 与手机端亚马逊列表预览</span>
        </h1>

        <section class="control-block">
          <h2 class="control-title">我的主图</h2>
          <div
            class="upload-card main-drop"
            :class="{ dragging: mainDragActive }"
            role="button"
            tabindex="0"
            aria-label="上传主图"
            @click="openMainFilePicker"
            @keydown.enter.prevent="openMainFilePicker"
            @keydown.space.prevent="openMainFilePicker"
            @dragenter.prevent="mainDragActive = true"
            @dragover.prevent="mainDragActive = true"
            @dragleave.prevent="handleMainDragLeave"
            @drop.prevent="handleMainDrop"
          >
            <input ref="mainFileInput" type="file" accept="image/*" @change="handleMainFile">
            <span class="upload-thumb"><img :src="mainImage" alt=""></span>
            <span class="upload-copy">
              <strong>上传主图</strong>
              <span>JPG / PNG / WebP</span>
            </span>
          </div>
        </section>

        <section class="control-block">
          <h2 class="control-title">竞品主图</h2>
          <label class="field library-field">
            <span>类目图库</span>
            <select v-model="selectedCategoryId" @change="applySelectedCategory">
              <option value="">默认图库</option>
              <option v-for="category in competitorCategories" :key="category.id" :value="category.id">{{ category.name }} · {{ category.images.length }} 张</option>
              <option v-if="customCompetitors" value="custom">临时上传 · {{ competitors.length }} 张</option>
            </select>
          </label>
          <div
            class="upload-card competitor-drop"
            :class="{ dragging: competitorDragActive }"
            role="button"
            tabindex="0"
            aria-label="上传竞品图片"
            @click="openCompetitorFilePicker"
            @keydown.enter.prevent="openCompetitorFilePicker"
            @keydown.space.prevent="openCompetitorFilePicker"
            @dragenter.prevent="competitorDragActive = true"
            @dragover.prevent="competitorDragActive = true"
            @dragleave.prevent="handleCompetitorDragLeave"
            @drop.prevent="handleCompetitorDrop"
          >
            <input ref="competitorFileInput" type="file" accept="image/*" multiple @change="handleCompetitorFiles">
            <input ref="competitorFolderInput" type="file" accept="image/*" multiple webkitdirectory directory @change="handleCompetitorFiles">
            <span class="upload-thumb"><img :src="competitors[0] || 'assets/scraped_B081DLDS6M.jpg'" alt=""></span>
            <span class="upload-copy">
              <strong>拖拽文件夹 / 批量上传</strong>
              <span>支持图片或整个文件夹</span>
              <span>{{ competitorCountText }}</span>
            </span>
            <div class="upload-actions">
              <button class="mini-btn" type="button" @click.stop="$refs.competitorFileInput.click()">选图片</button>
              <button class="mini-btn" type="button" @click.stop="openCompetitorFolderPicker">选文件夹</button>
            </div>
          </div>
          <button class="btn secondary full" type="button" @click="resetCompetitors">恢复默认竞品图</button>
        </section>

        <section class="control-block">
          <h2 class="control-title">页面设置</h2>
          <label class="field">
            <span>关键词</span>
            <input v-model="query" type="text">
          </label>
          <div class="two-col">
            <label class="field">
              <span>我的位置</span>
              <select v-model.number="myIndex">
                <option v-for="index in count" :key="index" :value="index - 1">第 {{ index }} 位</option>
              </select>
            </label>
            <label class="field">
              <span>商品数量</span>
              <select v-model.number="count">
                <option :value="12">12 个</option>
                <option :value="24">24 个</option>
                <option :value="30">30 个</option>
                <option :value="36">36 个</option>
                <option :value="40">40 个</option>
              </select>
            </label>
          </div>
          <label class="check-row">
            <input v-model="markMine" type="checkbox">
            <span>标记我的主图</span>
          </label>
        </section>

        <section class="control-block">
          <h2 class="control-title">预览</h2>
          <div class="segmented" role="group" aria-label="预览端">
            <button :class="{ active: view === 'pc' }" type="button" @click="setView('pc')">PC</button>
            <button :class="{ active: view === 'mobile' }" type="button" @click="setView('mobile')">手机</button>
            <button :class="{ active: view === 'both' }" type="button" @click="setView('both')">双端</button>
          </div>
          <div class="range-row">
            <span class="row-label">缩放</span>
            <output>{{ zoom }}%</output>
          </div>
          <input v-model.number="zoom" class="zoom-range" type="range" min="38" max="110">
          <button class="btn secondary" type="button" @click="shuffleCompetitors">换一组竞品</button>
        </section>

        <section class="control-block">
          <h2 class="control-title">导出</h2>
          <div class="button-stack">
            <button class="btn primary" type="button" @click="exportPng('pc')">导出 PC PNG</button>
            <button class="btn primary" type="button" @click="exportPng('mobile')">导出手机 PNG</button>
            <button class="btn secondary" type="button" @click="exportPng(view)">导出当前视图</button>
            <button class="btn secondary" type="button" @click="exportHtml">导出 HTML 单页（双端）</button>
          </div>
        </section>
      </aside>

      <main class="workspace">
        <section ref="previewRoot" class="preview-root" :data-view="view" :style="pageStyle">
          <article ref="pcPage" class="pc-page amazon-surface">
            <header class="pc-nav">
              <div class="brand-logo">GZ<span>team</span></div>
              <div class="nav-small">Deliver to<strong>Los Angeles</strong></div>
              <div class="pc-search">
                <select aria-label="Department"><option>All</option></select>
                <input :value="query" readonly>
                <button type="button" aria-label="Search">⌕</button>
              </div>
              <div class="pc-nav-actions">
                <span>Hello, sign in<strong>Account</strong></span>
                <span>Returns<strong>& Orders</strong></span>
                <span><strong>Cart</strong></span>
              </div>
            </header>
            <nav class="pc-subnav">
              <span>☰ All</span>
              <span>Early Prime Day</span>
              <span>Health AI</span>
              <span>Amazon Haul</span>
              <span>Amazon Basics</span>
              <span>Best Sellers</span>
              <span>Prime</span>
              <span>Books</span>
              <span>New Releases</span>
              <span>Groceries</span>
              <span>Gift Cards</span>
              <span>Sell</span>
              <span>Fashion</span>
              <span>Amazon Home</span>
              <span>Sports & Outdoors</span>
              <span>Home Improvement</span>
            </nav>
            <div class="pc-resultbar">
              <span>1-48 of over 100,000 results for <strong>"{{ query }}"</strong></span>
              <span class="sort-pill">Sort by: Featured</span>
            </div>
            <div class="pc-layout">
              <aside class="pc-filters">
                <div class="filter-group">
                  <div class="filter-title">Eligible for Free Shipping</div>
                  <div class="filter-line">□ Free Shipping by Amazon</div>
                  <div class="filter-line">Get FREE Shipping on eligible orders</div>
                  <div class="filter-line">shipped by Amazon</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Delivery Day</div>
                  <div class="filter-line">□ Get It by Tomorrow</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Pick Up</div>
                  <div class="filter-line">□ FREE Pickup</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Customer Reviews</div>
                  <div class="filter-line stars">★★★★☆ & Up</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Size</div>
                  <div class="filter-line">□ Large</div>
                  <div class="filter-line">□ Medium</div>
                  <div class="filter-line">□ One Size</div>
                  <div class="filter-line">□ Small</div>
                  <div class="filter-line">□ X-Large</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Price</div>
                  <div class="filter-line">$1 - $20,200+</div>
                  <div class="price-track"><span></span><span></span></div>
                  <div class="filter-line">Up to $25</div>
                  <div class="filter-line">$25 to $45</div>
                  <div class="filter-line">$45 to $60</div>
                  <div class="filter-line">$60 & above</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Deals & Discounts</div>
                  <div class="filter-line">All Discounts</div>
                  <div class="filter-line">Buy More, Save More</div>
                  <div class="filter-line">Coupons</div>
                  <div class="filter-line">Today's Deals</div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Color</div>
                  <div class="color-row">
                    <span style="background:#8b5e34"></span><span style="background:#f8f8f8"></span><span style="background:#111111"></span>
                    <span style="background:#356aa0"></span><span style="background:#76a15b"></span><span style="background:#f6ca45"></span><span style="background:#f49ba7"></span><span style="background:#f6a04d"></span>
                  </div>
                </div>
                <div class="filter-group">
                  <div class="filter-title">Closure</div>
                  <div class="filter-line">□ Zipper</div>
                  <div class="filter-line">□ Drawstring</div>
                  <div class="filter-line">□ Fold Top</div>
                  <div class="filter-line">□ Self Seal</div>
                </div>
              </aside>

              <section class="pc-results">
                <section class="brand-banner">
                  <div class="brand-copy">
                    <strong>LOREM</strong>
                    <span>Sponsored products for this category</span>
                    <span>Sponsored | 10K+ bought from this brand in past month</span>
                    <a href="#">Shop brand ›</a>
                  </div>
                  <div class="brand-strip">
                    <article v-for="(image, index) in brandImages" :key="image + index" class="brand-item">
                      <div class="brand-item-image"><img :src="image" alt=""></div>
                      <div class="brand-item-body">
                        <div>{{ placeholderTitles[index] }}...</div>
                        <div class="rating-row"><span class="stars">★★★★☆</span> 1.7K</div>
                        <div class="brand-price">$6<sup>99</sup></div>
                        <div class="prime">prime</div>
                      </div>
                    </article>
                  </div>
                </section>
                <h2 class="results-heading">Results</h2>
                <p class="results-note">Check each product page for other buying options. Price and other details may vary based on product size and color.</p>
                <div class="pc-grid">
                  <article v-for="product in cards" :key="product.id" class="pc-card" :class="{ 'is-mine': product.isMine, marked: product.isMine && markMine }">
                    <div class="pc-card-image"><img :src="product.image" alt=""></div>
                    <div class="pc-card-body">
                      <div class="ad-label" v-html="product.sponsored ? 'Sponsored' : '&nbsp;'"></div>
                      <div class="product-title">{{ product.title }}</div>
                      <div class="rating-row"><span class="stars">★★★★☆</span><span>{{ product.rating }}</span><span>{{ product.reviews }}</span></div>
                      <div class="sales-row">{{ product.bought }} bought in past month</div>
                      <div class="price"><sup>$</sup><strong>{{ product.priceWhole }}</strong><sup>{{ product.priceFraction }}</sup></div>
                      <div class="prime">prime</div>
                      <div class="delivery">FREE delivery {{ nextDeliveryLabel() }} on $35 of items shipped by Amazon</div>
                      <button class="cart-btn" type="button">Add to cart</button>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </article>

          <article ref="mobileShell" class="mobile-shell">
            <div class="phone-screen">
              <div class="phone-status"><span>{{ phoneTime || '09:41' }}</span><span>5G 100%</span></div>
              <div class="mobile-amz-nav"><span class="mobile-logo">GZ<span>team</span></span><span class="mobile-nav-icons"><span>Sign in</span><span>Cart</span></span></div>
              <div class="mobile-top">
                <div class="mobile-search"><span>⌕</span><input :value="query" readonly><span>□</span></div>
              </div>
              <div class="mobile-deliver"><span>Deliver to Los Angeles 90001</span><strong>Prime</strong></div>
              <div class="mobile-filters">
                <span>Filters</span><span>Prime</span><span>4 Stars & Up</span><span>Deals</span>
              </div>
              <section class="mobile-brand">
                <div class="mobile-brand-head">
                  <strong>Lorem</strong>
                  <div><strong>sponsored products for this category</strong><span>Sponsored | Top rated in this category</span></div>
                </div>
                <div class="mobile-brand-row">
                  <article v-for="(image, index) in brandImages" :key="'m-' + image + index" class="mobile-brand-card">
                    <img :src="image" alt="">
                    <div>{{ placeholderTitles[index] }}...<br><span class="stars">★★★★☆</span><br>$9<sup>99</sup> <span class="prime">prime</span></div>
                  </article>
                </div>
              </section>
              <div class="mobile-resultbar">Results for <strong>"{{ query }}"</strong></div>
              <div class="mobile-list">
                <article v-for="product in cards" :key="'mobile-' + product.id" class="mobile-card" :class="{ 'is-mine': product.isMine, marked: product.isMine && markMine }">
                  <div class="mobile-card-image"><img :src="product.image" alt=""></div>
                  <div class="mobile-card-body">
                    <div class="ad-label" v-html="product.sponsored ? 'Sponsored' : '&nbsp;'"></div>
                    <div class="product-title">{{ product.title }}</div>
                    <div class="rating-row"><span>{{ product.rating }}</span><span class="stars">★★★★☆</span><span>({{ product.reviews }})</span></div>
                    <div class="sales-row">{{ product.bought }} bought in past month</div>
                    <div class="price"><sup>$</sup><strong>{{ product.priceWhole }}</strong><sup>{{ product.priceFraction }}</sup></div>
                    <div class="delivery">FREE delivery {{ nextDeliveryLabel() }}<br>{{ product.bought }} bought recently</div>
                    <button class="cart-btn" type="button">Add to cart</button>
                  </div>
                </article>
              </div>
            </div>
          </article>
        </section>
      </main>

      <div v-if="exporting" class="export-mask">{{ exporting }}</div>
    </div>
  `
};

createApp(App).mount('#app');

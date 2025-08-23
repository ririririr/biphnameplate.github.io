const nameInput = document.getElementById('nameInput');
const downloadBtn = document.getElementById('downloadBtn');
const pagesContainer = document.getElementById('pagesContainer');

// We'll use PDF.js to load pages from nametap.pdf
const PDF_URL = 'nametap.pdf';
const FRAME_SRC = 'trans.png';

let pdfDoc = null;
let pageCanvases = []; // {pageNumber, canvas, width, height}
// Export scale for the frame/name relative to how it appears on-screen.
// <1.0 will make the frame and name smaller in the downloaded image.
const EXPORT_FRAME_SCALE = 0.78;

async function loadPdf() {
  if (!window.pdfjsLib) {
  showError('PDF.js failed to load. Check your network or CDN.');
  console.error('PDF.js not loaded');
  return;
  }
  try {
  pdfDoc = await window.pdfjsLib.getDocument(PDF_URL).promise;
    const total = pdfDoc.numPages;
  if (total === 0) throw new Error('PDF has no pages');
    for (let i = 1; i <= total; i++) {
      const page = await pdfDoc.getPage(i);
      // Render each page to fill the viewport. Use devicePixelRatio for crispness.
      const dpr = window.devicePixelRatio || 1;
      const pageView1 = page.getViewport({ scale: 1 });
      const targetCssWidth = window.innerWidth;
      const targetCssHeight = window.innerHeight;
      const scaleX = (targetCssWidth * dpr) / pageView1.width;
      const scaleY = (targetCssHeight * dpr) / pageView1.height;
      const renderScale = Math.max(scaleX, scaleY);
      const viewport = page.getViewport({ scale: renderScale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.className = 'page-canvas';
      // make canvas fill the viewport in CSS pixels
      canvas.style.width = targetCssWidth + 'px';
      canvas.style.height = targetCssHeight + 'px';

      const ctx = canvas.getContext('2d');
      const renderCtx = { canvasContext: ctx, viewport };
      await page.render(renderCtx).promise;

      const item = document.createElement('div');
      item.className = 'page-item';
      item.setAttribute('data-page', i);
      item.appendChild(canvas);
      pagesContainer.appendChild(item);

      pageCanvases.push({ pageNumber: i, canvas, viewport });
    }

    // Keep name in sync to the fixed frame-name element
    const frameNameEl = document.getElementById('frameName');
    nameInput.addEventListener('input', () => {
      frameNameEl.textContent = nameInput.value || 'Your Name';
    });

  } catch (err) {
    console.error('Error loading PDF:', err);
    showError('Unable to load PDF: ' + (err.message || err));
  }
}

function showError(msg){
  const el = document.getElementById('errorBanner');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

// Determine currently centered page item
function getCenteredPageItem() {
  // For container-scrolling, pick the page that intersects the container vertical center
  const container = pagesContainer;
  const containerRect = container.getBoundingClientRect();
  const viewportCenterY = containerRect.top + containerRect.height / 2;
  let chosen = null;
  let closest = Infinity;
  container.querySelectorAll('.page-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenterY = rect.top + rect.height / 2;
    const dist = Math.abs(itemCenterY - viewportCenterY);
    if (dist < closest) { closest = dist; chosen = item; }
  });
  return chosen;
}

// Compose the currently visible page + frame + name into a single canvas and return dataURL
async function composeCurrentNameplate() {
  const centered = getCenteredPageItem();
  if (!centered) return null;
  const pageNum = parseInt(centered.getAttribute('data-page'));
  const entry = pageCanvases.find(p => p.pageNumber === pageNum);
  if (!entry) return null;


  const pageCanvas = entry.canvas;
  // For composition, use the fixed overlay frame in viewport
  const fixedFrame = document.querySelector('.fixed-frame');
  const frameImg = fixedFrame.querySelector('img.frame');
  const nameEl = document.getElementById('frameName');

  // Use DOM measurements to compute correct composition geometry
  const pageItem = centered; // .page-item
  const pageRect = pageItem.getBoundingClientRect();
  const canvasRect = pageCanvas.getBoundingClientRect();

  const fixedRect = fixedFrame.getBoundingClientRect();

  // compute scale from DOM displayed canvas to pixel canvas
  const w = pageCanvas.width; // pixel width
  const h = pageCanvas.height; // pixel height
  const scale = w / canvasRect.width; // uniform scale

  const comp = document.createElement('canvas');
  comp.width = w;
  comp.height = h;
  const cctx = comp.getContext('2d');

  // draw background using the pixel canvas
  cctx.drawImage(pageCanvas, 0, 0, w, h);

  // Frame geometry from DOM overlay
  // Use fixed frame's DOM rect for geometry
  const frameDom = fixedRect; // frameImg.getBoundingClientRect();
  const framePixelW = frameDom.width * scale;
  const framePixelH = frameDom.height * scale;
  // frame position relative to canvas top-left (in pixels)
  const framePixelX = (frameDom.left - canvasRect.left) * scale;
  const framePixelY = (frameDom.top - canvasRect.top) * scale;

  // Apply export scaling so the frame and name appear smaller relative to the exported background
  const exportFrameW = framePixelW * EXPORT_FRAME_SCALE;
  const exportFrameH = framePixelH * EXPORT_FRAME_SCALE;
  // keep frame centered at the same center point when scaling down
  const frameCenterX = framePixelX + framePixelW / 2;
  const frameCenterY = framePixelY + framePixelH / 2;
  const exportFrameX = frameCenterX - exportFrameW / 2;
  const exportFrameY = frameCenterY - exportFrameH / 2;

  // draw frame (if not loaded yet, wait for it)
  await new Promise(resolve => {
    if (frameImg.complete) resolve(); else frameImg.onload = resolve; frameImg.onerror = resolve;
  });
  try { cctx.drawImage(frameImg, exportFrameX, exportFrameY, exportFrameW, exportFrameH); } catch(e){ /* ignore */ }

  // draw name text centered within frame
  const name = nameEl.textContent || 'Your Name';
  // choose font size proportional to frame pixel height
  // choose font size proportional to the exported frame height (so it scales with EXPORT_FRAME_SCALE)
  const fontSize = Math.max(24, Math.floor(exportFrameH * 0.26));
  // use the same cursive font family as the on-screen frame
  cctx.font = `${fontSize}px "Great Vibes", cursive`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'middle';
  cctx.fillStyle = '#ffffff';
  cctx.shadowColor = 'rgba(0,0,0,0.45)';
  cctx.shadowBlur = Math.floor(fontSize * 0.14);
  // place name at center of the frame in pixel coords
  const nameX = exportFrameX + exportFrameW / 2;
  const nameY = exportFrameY + exportFrameH / 2;
  cctx.fillText(name, nameX, nameY);

  return comp.toDataURL('image/png');
}

downloadBtn.addEventListener('click', async () => {
  const dataUrl = await composeCurrentNameplate();
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.download = 'nameplate.png';
  link.href = dataUrl;
  link.click();
});

// initialize
loadPdf();

// Scroll snapping helper: when user stops scrolling the pagesContainer, snap to nearest page
let scrollTimeout = null;
function snapToNearestPage(){
  const centered = getCenteredPageItem();
  if (!centered) return;
  const top = centered.offsetTop;
  pagesContainer.scrollTo({ top, behavior: 'smooth' });
}

// Clamp scroll to bounds to prevent overscrolling beyond first/last page
function clampScroll(){
  const maxScroll = pagesContainer.scrollHeight - pagesContainer.clientHeight;
  if (pagesContainer.scrollTop < 0) pagesContainer.scrollTop = 0;
  if (pagesContainer.scrollTop > maxScroll) pagesContainer.scrollTop = maxScroll;
}

// Use a short debounce to detect scroll end and snap
pagesContainer.addEventListener('scroll', () => {
  clampScroll();
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(snapToNearestPage, 120);
});


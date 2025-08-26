/**
 * Main application controller for the Interactive Nameplate Showcase
 * Coordinates all modules and handles initialization
 */
import EventBus from "./core/EventBus.js";
import ThemeManager from "./core/ThemeManager.js";
import themes from "./themes/themes.js";

class NameplateApp {
  constructor() {
    this.eventBus = new EventBus();
    this.themeManager = null;
    this.currentName = "Your Name";
    this.isInitialized = false;

    // Make event bus globally available
    window.eventBus = this.eventBus;

    // Bind methods
    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleThemeSwitch = this.handleThemeSwitch.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log("🚀 Initializing Interactive Nameplate Showcase...");

      // Initialize theme manager
      this.themeManager = new ThemeManager(themes, "holographic");

      // Create theme selector UI
      this.createThemeSelector();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize name input
      this.initializeNameInput();

      // Add loading fonts
      await this.loadFonts();

      // Mark as initialized
      this.isInitialized = true;

      // Emit ready event
      this.eventBus.emit("app:ready");

      console.log("✅ Application initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Create theme selector UI
   */
  createThemeSelector() {
    const selector = document.createElement("div");
    selector.className = "theme-selector";
    selector.setAttribute("aria-label", "Theme selector");

    themes.forEach((theme) => {
      const button = document.createElement("button");
      button.className = "theme-button interactive-element";
      button.setAttribute("data-theme", theme.id);
      button.setAttribute("aria-label", `Switch to ${theme.name} theme`);
      button.title = `${theme.name}: ${theme.description}`;

      // Add click handler
      button.addEventListener("click", () => {
        this.handleThemeSwitch(theme.id);
      });

      selector.appendChild(button);
    });

    document.body.appendChild(selector);

    // Set initial active theme
    this.updateActiveThemeButton("holographic");
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Theme change events
    this.eventBus.on("theme:changed", (data) => {
      this.updateActiveThemeButton(data.theme.id);
      console.log(`🎨 Theme changed to: ${data.theme.name}`);
    });

    // Theme transition events
    this.eventBus.on("theme:changing", (data) => {
      console.log(`🔄 Switching theme from ${data.from} to ${data.to}`);
    });

    // Error handling
    this.eventBus.on("theme:error", (data) => {
      console.error("Theme error:", data.error);
      this.showErrorMessage(`Failed to switch to theme: ${data.themeId}`);
    });

    // Name input events
    const nameInput = document.getElementById("nameInput");
    if (nameInput) {
      nameInput.addEventListener("input", this.handleNameInput);
      nameInput.addEventListener("focus", () => {
        nameInput.select();
      });
    }

    // Download button event
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        this.downloadNameplate();
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Number keys 1-5 for theme switching
      if (e.key >= "1" && e.key <= "5") {
        const themeIndex = parseInt(e.key) - 1;
        if (themes[themeIndex]) {
          this.handleThemeSwitch(themes[themeIndex].id);
        }
      }

      // Escape key to reset
      if (e.key === "Escape") {
        this.resetToDefaults();
      }
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  /**
   * Initialize name input functionality
   */
  initializeNameInput() {
    const nameInput = document.getElementById("nameInput");
    const frameNameEl = document.getElementById("frameName");

    if (nameInput && frameNameEl) {
      // Set initial value
      nameInput.value = this.currentName;
      frameNameEl.textContent = this.currentName;

      // Add placeholder animation
      nameInput.addEventListener("focus", () => {
        if (nameInput.value === "Your Name") {
          nameInput.value = "";
        }
      });

      nameInput.addEventListener("blur", () => {
        if (nameInput.value.trim() === "") {
          nameInput.value = "Your Name";
          this.handleNameInput({ target: nameInput });
        }
      });
    }
  }

  /**
   * Handle name input changes
   */
  handleNameInput(event) {
    const newName = event.target.value || "Your Name";
    this.currentName = newName;

    const frameNameEl = document.getElementById("frameName");
    if (frameNameEl) {
      frameNameEl.textContent = newName;

      // Add typing animation
      frameNameEl.style.animation = "none";
      frameNameEl.offsetHeight; // Trigger reflow
      frameNameEl.style.animation = "text-entrance 0.5s ease-out";
    }

    // Emit name change event
    this.eventBus.emit("name:changed", { name: newName });
  }

  /**
   * Handle theme switching
   */
  handleThemeSwitch(themeId) {
    if (this.themeManager) {
      this.themeManager.switchTheme(themeId);
    }
  }

  /**
   * Update active theme button
   */
  updateActiveThemeButton(themeId) {
    const buttons = document.querySelectorAll(".theme-button");
    buttons.forEach((button) => {
      button.classList.remove("active");
      if (button.getAttribute("data-theme") === themeId) {
        button.classList.add("active");
      }
    });
  }

  /**
   * Load custom fonts
   */
  async loadFonts() {
    const fonts = [
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap",
      "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
      "https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600&display=swap",
    ];

    const loadPromises = fonts.map((fontUrl) => {
      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = fontUrl;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });

    try {
      await Promise.all(loadPromises);
      console.log("✅ All fonts loaded successfully");
    } catch (error) {
      console.warn("⚠️ Some fonts failed to load:", error);
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Emit resize event for other components
    this.eventBus.emit("window:resize", {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  /**
   * Reset to default state
   */
  resetToDefaults() {
    const nameInput = document.getElementById("nameInput");
    if (nameInput) {
      nameInput.value = "Your Name";
      this.handleNameInput({ target: nameInput });
    }

    this.handleThemeSwitch("holographic");

    this.eventBus.emit("app:reset");
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-banner";
    errorMessage.textContent =
      "Failed to initialize application. Please refresh the page.";
    errorMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 600;
    `;

    document.body.appendChild(errorMessage);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.parentNode.removeChild(errorMessage);
      }
    }, 5000);
  }

  /**
   * Show error message to user
   */
  showErrorMessage(message) {
    console.error(message);

    // Create temporary error notification
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 107, 53, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideDown 0.3s ease-out";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  /**
   * 截屏下载 - 使用浏览器原生截屏API
   */
  async downloadNameplate() {
    try {
      // 先尝试使用浏览器原生截屏API
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        await this.useNativeScreenCapture();
      } else {
        // 降级到html2canvas
        await this.useHtml2Canvas();
      }
    } catch (error) {
      console.error("截屏失败:", error);
      this.showErrorMessage("截屏失败，请重试");
    }
  }

  /**
   * 使用浏览器原生截屏API
   */
  async useNativeScreenCapture() {
    // 隐藏不需要的元素
    const themeSelector = document.querySelector(".theme-selector");
    const bottomControls = document.querySelector(".bottom-controls");
    const container = document.querySelector(".container");

    if (themeSelector) themeSelector.style.display = "none";
    if (bottomControls) bottomControls.style.display = "none";
    if (container) container.style.display = "none";

    try {
      // 请求屏幕截图权限
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      await new Promise((resolve) => {
        video.addEventListener("loadedmetadata", () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx.drawImage(video, 0, 0);

          // 停止录制
          stream.getTracks().forEach((track) => track.stop());

          // 获取名牌框位置并裁剪
          this.cropAndDownload(canvas);

          resolve();
        });
      });
    } finally {
      // 恢复隐藏的元素
      if (themeSelector) themeSelector.style.display = "";
      if (bottomControls) bottomControls.style.display = "";
      if (container) container.style.display = "";
    }
  }

  /**
   * 使用html2canvas作为降级方案
   */
  async useHtml2Canvas() {
    // 加载html2canvas
    if (!window.html2canvas) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // 隐藏不需要的元素
    const themeSelector = document.querySelector(".theme-selector");
    const bottomControls = document.querySelector(".bottom-controls");
    const container = document.querySelector(".container");

    if (themeSelector) themeSelector.style.display = "none";
    if (bottomControls) bottomControls.style.display = "none";
    if (container) container.style.display = "none";

    try {
      // 截屏
      const canvas = await window.html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      this.cropAndDownload(canvas);
    } finally {
      // 恢复隐藏的元素
      if (themeSelector) themeSelector.style.display = "";
      if (bottomControls) bottomControls.style.display = "";
      if (container) container.style.display = "";
    }
  }

  /**
   * 裁剪并下载图片
   */
  cropAndDownload(sourceCanvas) {
    // 获取名牌框的位置
    const frameContainer = document.querySelector(
      ".fixed-frame .frame-container"
    );
    if (!frameContainer) {
      throw new Error("找不到名牌框");
    }

    const rect = frameContainer.getBoundingClientRect();
    const padding = 50;

    // 计算缩放比例
    const scaleX = sourceCanvas.width / window.innerWidth;
    const scaleY = sourceCanvas.height / window.innerHeight;

    // 创建裁剪后的画布
    const croppedCanvas = document.createElement("canvas");
    const ctx = croppedCanvas.getContext("2d");

    const cropWidth = (rect.width + padding * 2) * scaleX;
    const cropHeight = (rect.height + padding * 2) * scaleY;

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    // 裁剪名牌部分
    ctx.drawImage(
      sourceCanvas,
      (rect.left - padding) * scaleX,
      (rect.top - padding) * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // 下载
    const link = document.createElement("a");
    link.download = `nameplate-${this.currentName}-${Date.now()}.png`;
    link.href = croppedCanvas.toDataURL("image/png");
    link.click();

    this.showSuccessMessage("名牌截屏成功！");
  }

  /**
   * Apply theme gradient to canvas gradient object
   */
  applyThemeGradient(gradient, themeId) {
    switch (themeId) {
      case "neon-cyber":
        gradient.addColorStop(0, "#0a0a0a");
        gradient.addColorStop(0.5, "#1a0033");
        gradient.addColorStop(1, "#000a1a");
        break;
      case "nature-organic":
        gradient.addColorStop(0, "#f0f8e8");
        gradient.addColorStop(0.3, "#e8f5e8");
        gradient.addColorStop(0.7, "#d4f1d4");
        gradient.addColorStop(1, "#c8e6c8");
        break;
      case "minimalist-modern":
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.5, "#f8f9fa");
        gradient.addColorStop(1, "#e9ecef");
        break;
      case "retro-gaming":
        gradient.addColorStop(0, "#1a1a2e");
        gradient.addColorStop(0.5, "#16213e");
        gradient.addColorStop(1, "#0f3460");
        break;
      case "holographic":
      default:
        gradient.addColorStop(0, "#667eea");
        gradient.addColorStop(0.25, "#764ba2");
        gradient.addColorStop(0.5, "#f093fb");
        gradient.addColorStop(0.75, "#f5576c");
        gradient.addColorStop(1, "#4facfe");
        break;
    }
  }

  /**
   * Draw rounded rectangle helper
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (radius === 0) {
      ctx.rect(x, y, width, height);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Show success message to user
   */
  showSuccessMessage(message) {
    console.log(message);

    // Create temporary success notification
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(46, 204, 113, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
      font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideDown 0.3s ease-out";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  /**
   * Get current application state
   */
  getState() {
    return {
      currentName: this.currentName,
      currentTheme: this.themeManager?.getCurrentTheme()?.id,
      isInitialized: this.isInitialized,
    };
  }
}

export default NameplateApp;

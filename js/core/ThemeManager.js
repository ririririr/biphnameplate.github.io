/**
 * Theme management system with CSS custom properties
 * Handles theme switching, preloading, and transitions
 */
class ThemeManager {
  constructor(themes = [], defaultTheme = null) {
    this.themes = new Map();
    this.currentTheme = null;
    this.isTransitioning = false;
    this.preloadedAssets = new Set();
    
    // Initialize themes
    themes.forEach(theme => this.addTheme(theme));
    
    // Set default theme
    if (defaultTheme && this.themes.has(defaultTheme)) {
      this.switchTheme(defaultTheme);
    }
    
    // Listen for theme switch requests
    if (window.eventBus) {
      window.eventBus.on('theme:switch', (themeId) => {
        this.switchTheme(themeId);
      });
    }
  }

  /**
   * Add a theme to the manager
   * @param {Object} theme - Theme configuration
   */
  addTheme(theme) {
    if (!theme.id || !theme.name) {
      console.error('Theme must have id and name properties');
      return;
    }
    
    this.themes.set(theme.id, theme);
    this.preloadThemeAssets(theme.id);
  }

  /**
   * Switch to a different theme
   * @param {string} themeId - Theme identifier
   * @returns {Promise} Promise that resolves when theme is applied
   */
  async switchTheme(themeId) {
    if (!this.themes.has(themeId)) {
      console.error(`Theme ${themeId} not found`);
      return;
    }

    if (this.isTransitioning) {
      console.warn('Theme transition already in progress');
      return;
    }

    const newTheme = this.themes.get(themeId);
    const oldTheme = this.currentTheme;
    
    this.isTransitioning = true;
    
    try {
      // Emit theme change start event
      if (window.eventBus) {
        window.eventBus.emit('theme:changing', { from: oldTheme?.id, to: themeId });
      }

      // Apply theme transition
      await this.applyThemeTransition(oldTheme, newTheme);
      
      // Update current theme
      this.currentTheme = newTheme;
      
      // Emit theme change complete event
      if (window.eventBus) {
        window.eventBus.emit('theme:changed', { theme: newTheme, previous: oldTheme });
      }
      
    } catch (error) {
      console.error('Error switching theme:', error);
      if (window.eventBus) {
        window.eventBus.emit('theme:error', { error, themeId });
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Apply theme transition with smooth animations
   * @param {Object} fromTheme - Previous theme
   * @param {Object} toTheme - New theme
   */
  async applyThemeTransition(fromTheme, toTheme) {
    const root = document.documentElement;
    const body = document.body;
    
    // Add transition class for smooth changes
    body.classList.add('theme-transitioning');
    
    // Apply new theme CSS properties
    if (toTheme.cssProperties) {
      Object.entries(toTheme.cssProperties).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
    
    // Update theme class on body
    if (fromTheme) {
      body.classList.remove(`theme-${fromTheme.id}`);
    }
    body.classList.add(`theme-${toTheme.id}`);
    
    // Wait for transition to complete
    await new Promise(resolve => {
      setTimeout(() => {
        body.classList.remove('theme-transitioning');
        resolve();
      }, 500); // Match CSS transition duration
    });
  }

  /**
   * Preload theme assets for faster switching
   * @param {string} themeId - Theme identifier
   */
  async preloadThemeAssets(themeId) {
    const theme = this.themes.get(themeId);
    if (!theme || !theme.assets) return;
    
    const promises = [];
    
    // Preload images
    if (theme.assets.frameImage) {
      promises.push(this.preloadImage(theme.assets.frameImage));
    }
    
    if (theme.assets.backgroundPattern) {
      promises.push(this.preloadImage(theme.assets.backgroundPattern));
    }
    
    if (theme.assets.decorativeElements) {
      theme.assets.decorativeElements.forEach(src => {
        promises.push(this.preloadImage(src));
      });
    }
    
    try {
      await Promise.all(promises);
      this.preloadedAssets.add(themeId);
    } catch (error) {
      console.warn(`Failed to preload some assets for theme ${themeId}:`, error);
    }
  }

  /**
   * Preload a single image
   * @param {string} src - Image source URL
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Get current theme
   * @returns {Object} Current theme object
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Get all available themes
   * @returns {Array} Array of theme objects
   */
  getAllThemes() {
    return Array.from(this.themes.values());
  }

  /**
   * Check if theme is preloaded
   * @param {string} themeId - Theme identifier
   * @returns {boolean} True if preloaded
   */
  isThemePreloaded(themeId) {
    return this.preloadedAssets.has(themeId);
  }
}

export default ThemeManager;
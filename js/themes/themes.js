/**
 * Theme configurations for the Interactive Nameplate Showcase
 * Each theme provides a complete visual experience with CSS properties and assets
 */

const themes = [
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic cyberpunk aesthetic with neon colors and digital effects',
    cssProperties: {
      '--primary-color': '#00ffff',
      '--secondary-color': '#ff00ff',
      '--accent-color': '#ffff00',
      '--background-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #000a1a 100%)',
      '--background-pattern': 'radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
      '--text-color': '#ffffff',
      '--text-shadow': '0 0 10px var(--primary-color), 0 0 20px var(--primary-color), 0 0 30px var(--primary-color)',
      '--frame-border': '2px solid var(--primary-color)',
      '--frame-shadow': '0 0 20px var(--primary-color), inset 0 0 20px rgba(0, 255, 255, 0.1)',
      '--font-family': '"Orbitron", "Courier New", monospace',
      '--animation-glow': 'neon-glow 2s ease-in-out infinite alternate'
    },
    animations: {
      entrance: 'cyber-entrance',
      hover: 'cyber-hover',
      transition: 'cyber-transition'
    },
    effects: {
      particles: true,
      scanlines: true,
      glitch: true
    }
  },
  
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description: 'Earth-inspired design with organic shapes and natural colors',
    cssProperties: {
      '--primary-color': '#2d5016',
      '--secondary-color': '#8fbc8f',
      '--accent-color': '#daa520',
      '--background-gradient': 'linear-gradient(135deg, #f0f8e8 0%, #e8f5e8 30%, #d4f1d4 70%, #c8e6c8 100%)',
      '--background-pattern': 'radial-gradient(ellipse at top left, rgba(45, 80, 22, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(143, 188, 143, 0.1) 0%, transparent 50%)',
      '--text-color': '#2d5016',
      '--text-shadow': '2px 2px 4px rgba(45, 80, 22, 0.3)',
      '--frame-border': '3px solid var(--secondary-color)',
      '--frame-shadow': '0 8px 32px rgba(45, 80, 22, 0.2), inset 0 0 0 1px rgba(143, 188, 143, 0.3)',
      '--font-family': '"Dancing Script", "Georgia", serif',
      '--animation-glow': 'nature-breathe 3s ease-in-out infinite'
    },
    animations: {
      entrance: 'nature-grow',
      hover: 'nature-sway',
      transition: 'nature-bloom'
    },
    effects: {
      leaves: true,
      organic: true,
      breathing: true
    }
  },
  
  {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    description: 'Clean, sophisticated design with geometric precision',
    cssProperties: {
      '--primary-color': '#2c3e50',
      '--secondary-color': '#ecf0f1',
      '--accent-color': '#3498db',
      '--background-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
      '--background-pattern': 'linear-gradient(90deg, rgba(52, 152, 219, 0.03) 50%, transparent 50%), linear-gradient(rgba(52, 152, 219, 0.03) 50%, transparent 50%)',
      '--text-color': '#2c3e50',
      '--text-shadow': 'none',
      '--frame-border': '1px solid var(--accent-color)',
      '--frame-shadow': '0 10px 40px rgba(44, 62, 80, 0.1), 0 2px 8px rgba(44, 62, 80, 0.1)',
      '--font-family': '"Inter", "Helvetica Neue", sans-serif',
      '--animation-glow': 'minimal-pulse 4s ease-in-out infinite'
    },
    animations: {
      entrance: 'minimal-slide',
      hover: 'minimal-lift',
      transition: 'minimal-fade'
    },
    effects: {
      geometric: true,
      clean: true,
      subtle: true
    }
  },
  
  {
    id: 'retro-gaming',
    name: 'Retro Gaming',
    description: '8-bit inspired design with pixel art aesthetics',
    cssProperties: {
      '--primary-color': '#ff6b35',
      '--secondary-color': '#f7931e',
      '--accent-color': '#ffd23f',
      '--background-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      '--background-pattern': 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 107, 53, 0.1) 2px, rgba(255, 107, 53, 0.1) 4px), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(247, 147, 30, 0.1) 2px, rgba(247, 147, 30, 0.1) 4px)',
      '--text-color': '#ffd23f',
      '--text-shadow': '2px 2px 0px var(--primary-color), 4px 4px 0px rgba(0, 0, 0, 0.5)',
      '--frame-border': '4px solid var(--secondary-color)',
      '--frame-shadow': '8px 8px 0px var(--primary-color), 12px 12px 0px rgba(0, 0, 0, 0.3)',
      '--font-family': '"Press Start 2P", "Courier New", monospace',
      '--animation-glow': 'retro-blink 1s step-end infinite'
    },
    animations: {
      entrance: 'retro-spawn',
      hover: 'retro-bounce',
      transition: 'retro-warp'
    },
    effects: {
      pixelated: true,
      scanlines: true,
      retro: true
    }
  },
  
  {
    id: 'holographic',
    name: 'Holographic',
    description: 'Iridescent and metallic effects with futuristic styling',
    cssProperties: {
      '--primary-color': '#c471ed',
      '--secondary-color': '#12c2e9',
      '--accent-color': '#f64f59',
      '--background-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      '--background-pattern': 'conic-gradient(from 0deg at 50% 50%, rgba(196, 113, 237, 0.1) 0deg, rgba(18, 194, 233, 0.1) 120deg, rgba(246, 79, 89, 0.1) 240deg, rgba(196, 113, 237, 0.1) 360deg)',
      '--text-color': '#ffffff',
      '--text-shadow': '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px var(--primary-color), 0 0 30px var(--secondary-color)',
      '--frame-border': '2px solid transparent',
      '--frame-shadow': '0 0 30px rgba(196, 113, 237, 0.5), inset 0 0 30px rgba(18, 194, 233, 0.2)',
      '--font-family': '"Exo 2", "Arial", sans-serif',
      '--animation-glow': 'holographic-shift 3s linear infinite'
    },
    animations: {
      entrance: 'holographic-materialize',
      hover: 'holographic-float',
      transition: 'holographic-morph'
    },
    effects: {
      holographic: true,
      iridescent: true,
      metallic: true
    }
  }
];

export default themes;
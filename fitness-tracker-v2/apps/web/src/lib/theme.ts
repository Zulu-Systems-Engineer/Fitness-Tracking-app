import colorScheme from '../../../../color-scheme.json';

export const getTheme = (mode: 'light' | 'dark' = 'light') => {
  return colorScheme.theme[mode];
};

export const colors = colorScheme.colors;
export const usage = colorScheme.usage;

// Function to set CSS variables for the theme
export const setThemeVariables = (mode: 'light' | 'dark') => {
  const theme = getTheme(mode);
  const root = document.documentElement;

  // Background colors
  root.style.setProperty('--background-primary', theme.background.primary);
  root.style.setProperty('--background-secondary', theme.background.secondary);
  root.style.setProperty('--background-tertiary', theme.background.tertiary);

  // Text colors
  root.style.setProperty('--text-primary', theme.text.primary);
  root.style.setProperty('--text-secondary', theme.text.secondary);
  root.style.setProperty('--text-muted', theme.text.muted);

  // Border colors
  root.style.setProperty('--border-default', theme.border.DEFAULT);
  root.style.setProperty('--border-focus', theme.border.focus);

  // Card colors
  root.style.setProperty('--card-bg', theme.card.bg);
  root.style.setProperty('--card-border', theme.card.border);

  // Input colors
  root.style.setProperty('--input-bg', theme.input.bg);
  root.style.setProperty('--input-border', theme.input.border);
  root.style.setProperty('--input-text', theme.input.text);
  root.style.setProperty('--input-placeholder', theme.input.placeholder);

  // Button colors
  root.style.setProperty('--button-primary-bg', theme.button.primary.bg);
  root.style.setProperty('--button-primary-text', theme.button.primary.text);
  root.style.setProperty('--button-primary-hover', theme.button.primary.hover);
  root.style.setProperty('--button-primary-active', theme.button.primary.active);
  
  root.style.setProperty('--button-secondary-bg', theme.button.secondary.bg);
  root.style.setProperty('--button-secondary-text', theme.button.secondary.text);
  root.style.setProperty('--button-secondary-hover', theme.button.secondary.hover);
  root.style.setProperty('--button-secondary-active', theme.button.secondary.active);
  
  root.style.setProperty('--button-ghost-bg', theme.button.ghost.bg);
  root.style.setProperty('--button-ghost-text', theme.button.ghost.text);
  root.style.setProperty('--button-ghost-hover', theme.button.ghost.hover);
  root.style.setProperty('--button-ghost-active', theme.button.ghost.active);
  
  root.style.setProperty('--button-outline-bg', theme.button.outline.bg);
  root.style.setProperty('--button-outline-text', theme.button.outline.text);
  root.style.setProperty('--button-outline-border', theme.button.outline.border);
  root.style.setProperty('--button-outline-hover', theme.button.outline.hover);

  // Glassmorphism colors - use light/dark variants based on theme
  const glassmorphism = colorScheme.usage.glassmorphism[mode];
  root.style.setProperty('--glassmorphism-bg', glassmorphism.background);
  root.style.setProperty('--glassmorphism-bg-hover', glassmorphism.backgroundHover);
  root.style.setProperty('--glassmorphism-border', glassmorphism.border);
  root.style.setProperty('--glassmorphism-border-hover', glassmorphism.borderHover);
  root.style.setProperty('--glassmorphism-text', glassmorphism.text);
  root.style.setProperty('--glassmorphism-text-muted', glassmorphism.textMuted);
  root.style.setProperty('--glassmorphism-text-secondary', glassmorphism.textSecondary);
  root.style.setProperty('--glassmorphism-blur', glassmorphism.backdropBlur);
  root.style.setProperty('--glassmorphism-shadow', glassmorphism.shadow);
  root.style.setProperty('--glassmorphism-shadow-hover', glassmorphism.shadowHover);
  root.style.setProperty('--glassmorphism-accent-glow', glassmorphism.accentGlow);

  // Additional color scheme colors
  root.style.setProperty('--primary-50', colorScheme.colors.primary[50]);
  root.style.setProperty('--primary-500', colorScheme.colors.primary[500]);
  root.style.setProperty('--primary-600', colorScheme.colors.primary[600]);
  root.style.setProperty('--primary-700', colorScheme.colors.primary[700]);
  root.style.setProperty('--primary-900', colorScheme.colors.primary[900]);
  
  root.style.setProperty('--secondary-50', colorScheme.colors.secondary[50]);
  root.style.setProperty('--secondary-100', colorScheme.colors.secondary[100]);
  root.style.setProperty('--secondary-500', colorScheme.colors.secondary[500]);
  root.style.setProperty('--secondary-600', colorScheme.colors.secondary[600]);
  root.style.setProperty('--secondary-700', colorScheme.colors.secondary[700]);
  
  root.style.setProperty('--accent-500', colorScheme.colors.accent[500]);
  root.style.setProperty('--accent-600', colorScheme.colors.accent[600]);
  
  // Semantic colors
  root.style.setProperty('--success-light', colorScheme.colors.semantic.success.light);
  root.style.setProperty('--success-default', colorScheme.colors.semantic.success.DEFAULT);
  root.style.setProperty('--success-dark', colorScheme.colors.semantic.success.dark);
  
  root.style.setProperty('--warning-light', colorScheme.colors.semantic.warning.light);
  root.style.setProperty('--warning-default', colorScheme.colors.semantic.warning.DEFAULT);
  root.style.setProperty('--warning-dark', colorScheme.colors.semantic.warning.dark);
  
  root.style.setProperty('--error-light', colorScheme.colors.semantic.error.light);
  root.style.setProperty('--error-default', colorScheme.colors.semantic.error.DEFAULT);
  root.style.setProperty('--error-dark', colorScheme.colors.semantic.error.dark);
  
  root.style.setProperty('--info-light', colorScheme.colors.semantic.info.light);
  root.style.setProperty('--info-default', colorScheme.colors.semantic.info.DEFAULT);
  root.style.setProperty('--info-dark', colorScheme.colors.semantic.info.dark);

  // Set the class on html element
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

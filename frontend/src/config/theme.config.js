/**
 * Theme key → CSS custom property mapping.
 * Tokens live in styles/tokens.css; this config is the JS bridge for later theming.
 */

const themeConfig = {
  mode: "light",
  tokens: {
    brand: {
      primary: "var(--color-brand-600)",
      hover: "var(--color-brand-700)",
      subtle: "var(--color-brand-50)",
    },
    surface: {
      page: "var(--color-surface-page)",
      default: "var(--color-surface-default)",
      muted: "var(--color-surface-muted)",
    },
    text: {
      primary: "var(--color-text-primary)",
      secondary: "var(--color-text-secondary)",
      muted: "var(--color-text-muted)",
      inverse: "var(--color-text-inverse)",
    },
    border: {
      default: "var(--color-border-default)",
      strong: "var(--color-border-strong)",
      focus: "var(--color-border-focus)",
    },
    sidebar: {
      bg: "var(--color-sidebar-bg)",
      brandBg: "var(--color-sidebar-brand-bg)",
      itemActiveBg: "var(--color-sidebar-item-active-bg)",
    },
    header: {
      bg: "var(--color-header-bg)",
      border: "var(--color-header-border)",
      text: "var(--color-header-text)",
    },
    footer: {
      bg: "var(--color-footer-bg)",
      border: "var(--color-footer-border)",
      text: "var(--color-footer-text)",
    },
    card: {
      bg: "var(--color-card-bg)",
      border: "var(--color-card-border)",
      shadow: "var(--color-card-shadow)",
    },
    table: {
      bg: "var(--color-table-bg)",
      headerBg: "var(--color-table-header-bg)",
      border: "var(--color-table-border)",
    },
    input: {
      bg: "var(--color-input-bg)",
      border: "var(--color-input-border)",
      focus: "var(--color-input-border-focus)",
    },
    button: {
      primaryBg: "var(--color-button-primary-bg)",
      primaryText: "var(--color-button-primary-text)",
      dangerBg: "var(--color-button-danger-bg)",
    },
    success: {
      bg: "var(--color-success-50)",
      text: "var(--color-success-text)",
      solid: "var(--color-success-600)",
    },
    warning: {
      bg: "var(--color-warning-50)",
      text: "var(--color-warning-text)",
      solid: "var(--color-warning-600)",
    },
    danger: {
      bg: "var(--color-danger-50)",
      text: "var(--color-danger-text)",
      solid: "var(--color-danger-600)",
    },
    info: {
      bg: "var(--color-info-50)",
      text: "var(--color-info-text)",
      solid: "var(--color-info-600)",
    },
  },
};

export default themeConfig;

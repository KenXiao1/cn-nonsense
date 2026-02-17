const PREFERRED_COLOR_SCHEME = "preferred_color_scheme";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

export function resolveGiscusTheme(configuredTheme: string, isDark: boolean): string {
  if (configuredTheme !== PREFERRED_COLOR_SCHEME) {
    return configuredTheme;
  }
  return isDark ? DARK_THEME : LIGHT_THEME;
}

export function createGiscusThemeMessage(theme: string) {
  return {
    giscus: {
      setConfig: {
        theme
      }
    }
  };
}

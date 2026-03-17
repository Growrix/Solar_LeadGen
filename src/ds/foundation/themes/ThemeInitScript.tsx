import * as React from "react";

import { DEFAULT_THEME, THEMES } from "./registry";
import { THEME_STORAGE_KEY } from "./theme";

export function ThemeInitScript() {
  const activeThemeNames = JSON.stringify(THEMES.map((t) => t.name));
  const code = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var active=${activeThemeNames};var theme=${JSON.stringify(DEFAULT_THEME)};if(t&&active.indexOf(t)!==-1){theme=t;}var root=document.documentElement;var classes=Array.prototype.slice.call(root.classList);for(var i=0;i<classes.length;i++){if(classes[i].indexOf('theme-')===0)root.classList.remove(classes[i]);}root.classList.add('theme-'+theme);if(theme==='dark'){root.classList.add('dark');}else{root.classList.remove('dark');}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

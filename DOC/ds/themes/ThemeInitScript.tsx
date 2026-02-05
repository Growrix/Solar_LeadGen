import * as React from "react";

import { THEME_STORAGE_KEY } from "./theme";

export function ThemeInitScript() {
  const code = `(function(){try{var k=${JSON.stringify(
    THEME_STORAGE_KEY
  )};var t=localStorage.getItem(k);var theme=(t==='light'||t==='dark'||t==='purple')?t:'dark';var root=document.documentElement;var classes=Array.prototype.slice.call(root.classList);for(var i=0;i<classes.length;i++){if(classes[i].indexOf('theme-')===0)root.classList.remove(classes[i]);}root.classList.add('theme-'+theme);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

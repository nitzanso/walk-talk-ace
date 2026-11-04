import React, { createContext, useContext, useEffect } from 'react';
import { useSetting } from './db.js';
import * as EN from './content.js';
import * as HEC from './content.he.js';
import HE from './he.js';

const Ctx = createContext({ he: false, lang: 'en-US', t: (s) => s, C: EN });

export function I18n({ children }) {
  const [lang] = useSetting('lang', 'en-US');
  const he = lang === 'he-IL';
  useEffect(() => {
    document.documentElement.lang = he ? 'he' : 'en';
    document.documentElement.dir = he ? 'rtl' : 'ltr';
  }, [he]);
  const t = (s, vars) => {
    let out = he && HE[s] !== undefined ? HE[s] : s;
    if (vars) Object.keys(vars).forEach((k) => { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  };
  return <Ctx.Provider value={{ he, lang, t, C: he ? HEC : EN }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);

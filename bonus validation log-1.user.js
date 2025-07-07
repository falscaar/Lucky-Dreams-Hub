// ==UserScript==
// @name         bonus validation log
// @namespace    http://tampermonkey.net/
// @version      1
// @description  x
// @author       Retention
// @match        *://*/*/bonus_dsl*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  window.addEventListener('load', () => {
    const rows = [...document.querySelectorAll('tr.dsl-title-row')];
    console.log('Нашли dsl-title-row:', rows.length);

    for (const row of rows) {
      const trigger = row.querySelector('td')?.textContent.trim();
      const identifier = row.querySelectorAll('td')[4]?.textContent.trim();
      console.log('▶️ Trigger:', trigger, '| Identifier:', identifier);

      const next = row.nextElementSibling;
      if (!next) {
        console.log('⛔ Нет строки с деталями после заголовка');
        continue;
      }

      const valid = next.querySelectorAll('td')[1]?.textContent.trim().toLowerCase() === 'yes';
      const type = next.querySelectorAll('td')[0]?.textContent.trim();
      console.log('➡️ Type:', type, '| Valid:', valid);
    }
  });
})();

})();
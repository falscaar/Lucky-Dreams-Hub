// ==UserScript==
// @name         Highlight Allow duplicates: false
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  dsl
// @author       LD Retention
// @include      *backend/bonus_dsl*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function highlightDuplicatesFalse() {
        const bonusRows = document.querySelectorAll('tr.dsl-title-row');

        bonusRows.forEach(row => {
            const tdList = row.querySelectorAll('td');
            const identifier = tdList[tdList.length - 1]?.textContent.trim() || '';

            if (!/retention/i.test(identifier)) return;

            const detailsRow = row.nextElementSibling;
            if (!detailsRow) return;

            const liElements = detailsRow.querySelectorAll('li');
            liElements.forEach(li => {
                const text = li.textContent.trim();
                if (text.startsWith('Allow duplicates:')) {
                    if (text === 'Allow duplicates: false') {
                        li.style.backgroundColor = 'yellow';
                    }
                }
            });
        });
    }

    setTimeout(highlightDuplicatesFalse, 3000);
})();
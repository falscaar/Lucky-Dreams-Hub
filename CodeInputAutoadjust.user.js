// ==UserScript==
// @name         CodeInputAutoadjust
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Code adjuster
// @author       Retention
// @match        *://*/*/bonus_dsl*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    let selectedCodeInput = null;
    let selectedBonusId = null;
    let selectedFieldType = null;

    document.addEventListener('click', (event) => {
        if (
            event.target.tagName.toLowerCase() === 'input' &&
            event.target.id.includes('_code_value')
        ) {
            selectedCodeInput = event.target;

            const match = event.target.name.match(/bonus_dsl_input_form\[([^\]]+)]\[value]/);
            if (match) {
                selectedBonusId = match[1];
                selectedFieldType = selectedBonusId.split('_').pop();
                console.log(`Выбран input для вставки: ${selectedBonusId}, Тип поля: ${selectedFieldType}`);
            }
        }
    });

    function transformCodeInput() {
        if (!selectedCodeInput) {
            console.log("Сперва кликните по полю инпута code.");
            return;
        }

        const originalValue = selectedCodeInput.value.trim();
        if (!originalValue) {
            console.log("Поле пустое.");
            return;
        }

        const codes = originalValue
            .split(/[\s,\.]+/)
            .map(code => code.replace(/[^a-zA-Z0-9]/g, ''))
            .filter(Boolean);

        const transformed = [];

        codes.forEach(code => {
            if (!code) return;

            const upper = code.toUpperCase();
            const lower = code.toLowerCase();
            const capitalized = code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();

            transformed.push(upper, capitalized, lower);
        });

        const uniqueTransformed = [...new Set(transformed)];

        selectedCodeInput.value = uniqueTransformed.join(', ');
        selectedCodeInput.dispatchEvent(new Event('input', { bubbles: true }));

        console.log("Поле инпута обновлено:", selectedCodeInput.value);
    }

    // dlya hotkeya
    document.addEventListener("keydown", (event) => {
        const isMac = navigator.platform.includes("Mac");
        const shortcutPressed = (isMac && event.metaKey && event.shiftKey && event.code === "KeyF") ||
                                (!isMac && event.altKey && event.shiftKey && event.code === "KeyF");

        if (shortcutPressed) {
            event.preventDefault();
            transformCodeInput();
        }
    });

    // Button
    GM_registerMenuCommand("Adjust code(s)", transformCodeInput);
})();
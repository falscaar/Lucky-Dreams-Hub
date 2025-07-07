// ==UserScript==
// @name         Internal ID Constructor UI
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  internal id constructor with dropdown interface
// @author       Retention
// @match        *://*/*/bonus_dsl*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const departments = ["CRM", "VIP", "CAS", "LOY", "CS", "ENT", "LIVE", "REF", "ACQ", "LOOT", "TELEGRAM"];
    const tiers = ["RND", "NVIP", "VIP", "ELITE", "ALL", "MAN"];
    const promoTypes = ["ADHOC", "ALWAYS", "AUTO", "HEAD", "MAN", "PREREL", "TOURN", "PROVPUSH", "DROP", "SOTW", "CUSTGAME", "JP", "FSPOT"];
    const promoObjectives = ["CONV", "RET", "REAC", "XSELL", "UPSELL", "MAN", "COMMER"];

    let selectedInput = null;
    let uiContainer = null;

    function createSelect(options, id) {
        const select = document.createElement('select');
        select.id = id;
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
        return select;
    }

    function removeUI() {
        if (uiContainer) {
            uiContainer.remove();
            uiContainer = null;
        }
    }

    function showInterface() {
        if (!selectedInput) return;

        removeUI();

        uiContainer = document.createElement('div');
        uiContainer.style.position = 'absolute';
        uiContainer.style.backgroundColor = '#fff';
        uiContainer.style.border = '1px solid #ccc';
        uiContainer.style.padding = '10px';
        uiContainer.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        uiContainer.style.zIndex = '9999';
        uiContainer.style.fontSize = '14px';
        uiContainer.style.display = 'flex';
        uiContainer.style.gap = '5px';
        uiContainer.style.flexWrap = 'wrap';
        uiContainer.style.alignItems = 'center';
        uiContainer.style.borderRadius = '6px';

        const departmentSelect = createSelect(departments, 'departmentSelect');
        const tierSelect = createSelect(tiers, 'tierSelect');
        const promoTypeSelect = createSelect(promoTypes, 'promoTypeSelect');
        const promoObjectiveSelect = createSelect(promoObjectives, 'promoObjectiveSelect');

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Form';
        confirmBtn.style.padding = '4px 8px';
        confirmBtn.style.cursor = 'pointer';

        confirmBtn.onclick = () => {
            const promoName = selectedInput.value.trim();
            if (!promoName) {
                console.log('Введите Promo name.');
                return;
            }

            const result = [
                departmentSelect.value,
                tierSelect.value,
                promoTypeSelect.value,
                promoObjectiveSelect.value,
                promoName
            ].join('_');

            selectedInput.value = result;
            selectedInput.dispatchEvent(new Event('input', { bubbles: true }));
            removeUI();
        };

        uiContainer.appendChild(departmentSelect);
        uiContainer.appendChild(tierSelect);
        uiContainer.appendChild(promoTypeSelect);
        uiContainer.appendChild(promoObjectiveSelect);
        uiContainer.appendChild(confirmBtn);

        document.body.appendChild(uiContainer);

        const rect = selectedInput.getBoundingClientRect();
        uiContainer.style.top = `${window.scrollY + rect.bottom + 5}px`;
        uiContainer.style.left = `${window.scrollX + rect.left}px`;
    }

    document.addEventListener('click', (event) => {
    if (
        event.target.tagName.toLowerCase() === 'input' &&
        event.target.id.includes('_internal')
    ) {
        selectedInput = event.target;
    } else if (
        event.target.tagName.toLowerCase() === 'input' &&
        !event.target.id.includes('_internal')
    ) {
        selectedInput = null;
        removeUI();
    } else if (uiContainer && uiContainer.contains(event.target)) {
        // клик по интерфейсу
        return;
    } else {
        selectedInput = null;
        removeUI(); // клик вне
    }
});

    // хоткей
    document.addEventListener("keydown", (event) => {
        const isMac = navigator.platform.includes("Mac");
        const shortcutPressed = (isMac && event.metaKey && event.shiftKey && event.code === "KeyF") ||
                                (!isMac && event.altKey && event.shiftKey && event.code === "KeyF");

        if (shortcutPressed) {
            event.preventDefault();
            if (!selectedInput) {
                console.log("Кликните по полю internal input перед запуском.");
                return;
            }
            showInterface();
        }
    });

// меню ПКМ
GM_registerMenuCommand("Open UI constructor", () => {
    if (!selectedInput) {
        alert("Сначала кликни по нужному полю internal input.");
        return;
    }
    showInterface();
});

})();

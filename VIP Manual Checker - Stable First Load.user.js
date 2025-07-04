// ==UserScript==
// @name         VIP Manual Checker - Stable First Load
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Reacts to "VIP - Bonus limitation Group Manual" (SPA-safe, newsletter-only, DOM-ready)
// @match        *://fly.customer.io/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let currentUrl = location.href;
    let lastHadVIP = null;
    let observer = null;
    let intervalId = null;

    function isNewsletterPage() {
        return location.href.includes("newsletter");
    }

    function hasVIPManualText() {
        const spans = document.querySelectorAll('span.data-source-label span');
        return Array.from(spans).some(el => el.textContent.includes("VIP - Bonus limitation Group Manual"));
    }

    function updateHeaders(showWarning) {
        const h4s = document.querySelectorAll("h4.text-truncate, h4[class*='text-truncate']");
        h4s.forEach(h4 => {
            const text = h4.textContent.trim();
            if (showWarning) {
                if (!text.startsWith("❓")) {
                    h4.textContent = "❓ " + text;
                    h4.style.color = "red";
                    h4.style.fontWeight = "bold";
                }
            } else {
                if (text.startsWith("❓")) {
                    h4.textContent = text.replace(/^❓\s*/, '');
                    h4.style.color = "";
                    h4.style.fontWeight = "";
                }
            }
        });
    }

    function performCheck() {
        const hasVIP = hasVIPManualText();
        if (hasVIP !== lastHadVIP) {
            lastHadVIP = hasVIP;
            setTimeout(() => updateHeaders(!hasVIP), 300); // задержка 1.5 сек
        }
    }

    function startObservers() {
        // Периодическая проверка (на случай, если Observer не поймал)
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(performCheck, 1000);

        // MutationObserver на всё тело
        if (observer) observer.disconnect();
        observer = new MutationObserver(() => performCheck());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObservers() {
        if (observer) observer.disconnect();
        if (intervalId) clearInterval(intervalId);
    }

    function monitorURLChange() {
        setInterval(() => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                lastHadVIP = null;

                if (isNewsletterPage()) {
                    startObservers();
                } else {
                    stopObservers();
                }
            }
        }, 500);
    }

    // Инициализация
    if (isNewsletterPage()) startObservers();
    monitorURLChange();
})();
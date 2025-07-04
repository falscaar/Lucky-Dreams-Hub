// ==UserScript==
// @name         labels_highlighted
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Jira labels section highlighted
// @match        https://*/browse/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function highlightIfNoLabels() {
        const labelWrap = document.querySelector('#wrap-labels');
        if (!labelWrap) return;

        const originalLabel = labelWrap.querySelector('label');
        const labelText = labelWrap.querySelector('.labels');
        const labelsWrap = labelWrap.querySelector('.labels-wrap');

        if (labelText && labelText.textContent.trim() === 'None') {
            if (originalLabel) {
                originalLabel.style.position = 'absolute';
                originalLabel.style.left = '-9999px';
                originalLabel.style.visibility = 'hidden';
            }

            let customLabel = labelWrap.querySelector('.custom-label');
            if (!customLabel) {
                customLabel = document.createElement('strong');
                customLabel.className = 'custom-label';
                customLabel.textContent = 'Labels:';
                customLabel.style.color = 'red';
                customLabel.style.fontWeight = 'bold';
                customLabel.style.fontSize = '1.3em';
                customLabel.style.marginRight = '6px';
                customLabel.style.userSelect = 'none';
            }

            labelWrap.style.display = 'flex';
            labelWrap.style.alignItems = 'baseline';
            labelWrap.style.border = '2px solid red';
            labelWrap.style.borderRadius = '6px';
            labelWrap.style.padding = '8px';
            labelWrap.style.marginTop = '5px';
            labelWrap.style.marginBottom = '5px';
            labelWrap.style.backgroundColor = '#ffe6e6';

            if (!labelWrap.contains(customLabel)) {
                labelWrap.insertBefore(customLabel, labelsWrap);
            }

            labelText.style.color = 'red';
            labelText.style.fontWeight = 'bold';
            labelText.style.fontSize = '1.3em';

        } else {
            if (originalLabel) {
                originalLabel.style.position = '';
                originalLabel.style.left = '';
                originalLabel.style.visibility = '';
            }

            const customLabel = labelWrap.querySelector('.custom-label');
            if (customLabel) customLabel.remove();

            if (labelText) {
                labelText.style.color = '';
                labelText.style.fontWeight = '';
                labelText.style.fontSize = '';
            }

            labelWrap.style.display = '';
            labelWrap.style.alignItems = '';
            labelWrap.style.border = '';
            labelWrap.style.borderRadius = '';
            labelWrap.style.padding = '';
            labelWrap.style.marginTop = '';
            labelWrap.style.marginBottom = '';
            labelWrap.style.backgroundColor = '';
        }
    }

    const observer = new MutationObserver(() => {
        highlightIfNoLabels();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    highlightIfNoLabels();
})();
// ==UserScript==
// @name         DSL-BetterGroupsAwareness
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Groups input - better awareness
// @author       ChatGPT
// @include      *backend/bonus_dsl*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .all-label-highlight {
                color: red !important;
                font-weight: bold !important;
            }
            .highlight-yellow {
                background-color: yellow !important;
            }
        `;
        document.head.appendChild(style);
    }

    function processRadioGroup(fieldset) {
        const allInput = fieldset.querySelector('input[value="all"]');
        const onlyInput = fieldset.querySelector('input[value="only"]');
        const exceptInput = fieldset.querySelector('input[value="except"]');
        if (!allInput || !onlyInput || !exceptInput) return;

        const allLabel = allInput.closest('label');
        if (!allLabel) return;

        // Убедимся, что у нас есть отдельный текстовый span
        let labelTextNode = allLabel.querySelector('.label-text');
        if (!labelTextNode) {
            const originalText = allLabel.textContent.trim();
            labelTextNode = document.createElement('span');
            labelTextNode.className = 'label-text';
            labelTextNode.textContent = originalText;
            allLabel.textContent = ''; // очистить всё
            allLabel.appendChild(allInput); // вставляем input обратно
            allLabel.appendChild(labelTextNode); // добавляем span
        }

        const originalLabelText = labelTextNode.textContent;

        function updateStyle() {
            if (allInput.checked) {
                allLabel.classList.add('all-label-highlight');
                labelTextNode.textContent = '⚠️ All';
            } else {
                allLabel.classList.remove('all-label-highlight');
                labelTextNode.textContent = originalLabelText;
            }
        }

        updateStyle();

        onlyInput.addEventListener('change', () => {
            if (onlyInput.checked) updateStyle();
        });
        exceptInput.addEventListener('change', () => {
            if (exceptInput.checked) updateStyle();
        });

        allLabel.addEventListener('click', (e) => {
            if (allInput.checked) return;

            e.preventDefault();

            const confirmed = confirm('Do you confirm you want to change the logic to "All" for this input?');
            if (confirmed) {
                setTimeout(() => {
                    allInput.checked = true;
                    updateStyle();
                }, 10);
            } else {
                updateStyle();
            }
        });
    }

    function highlightUserAllGroups() {
        const listItems = document.querySelectorAll('li.groups_condition > div');
        listItems.forEach(div => {
            const text = div.textContent.trim().toLowerCase();
            if (text.startsWith('user should have all groups:')) {
                div.parentElement.classList.add('highlight-yellow');
            }
        });
    }

    function observeDOM() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;

                    if (node.matches('fieldset.choices')) {
                        processRadioGroup(node);
                    } else {
                        const fieldsets = node.querySelectorAll('fieldset.choices');
                        fieldsets.forEach(fs => processRadioGroup(fs));
                    }

                    if (node.matches('li.groups_condition') || node.querySelector('li.groups_condition')) {
                        highlightUserAllGroups();
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    addStyles();
    document.querySelectorAll('fieldset.choices').forEach(processRadioGroup);
    highlightUserAllGroups();
    observeDOM();
})();

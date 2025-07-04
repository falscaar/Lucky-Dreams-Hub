// ==UserScript==
// @name         Highlighted Rows Filter
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Show only table rows with highlighted elements (green, red, blue)
// @author       You
// @match https://docs.softswiss.com/pages/diffpagesbyversion.action*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Функция для фильтрации строк таблицы
    function filterTableRows() {
        const table = document.querySelector('.table-wrap table'); // Ищем таблицу
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr'); // Все строки таблицы

        rows.forEach((row, index) => {
            // Пропускаем первую строку, если это заголовок
            if (index === 0) {
                row.style.display = ''; // Показываем заголовок
                return;
            }

            // Проверяем, есть ли в строке элементы с выделением
            const hasHighlight = row.querySelector(
                '.diff-html-added, .diff-html-removed, .diff-html-changed'
            );
            if (hasHighlight) {
                row.style.display = ''; // Показываем строку
            } else {
                row.style.display = 'none'; // Скрываем строку
            }
        });
    }

    // Функция для сброса фильтра (показываем все строки)
    function resetTableRows() {
        const table = document.querySelector('.table-wrap table'); // Ищем таблицу
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr'); // Все строки таблицы
        rows.forEach(row => {
            row.style.display = ''; // Показываем все строки
        });
    }

    // Создаём чекбокс и текстовую метку
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.style.marginBottom = '10px';
    checkboxWrapper.style.fontFamily = 'Arial, sans-serif';
    checkboxWrapper.style.display = 'flex';
    checkboxWrapper.style.alignItems = 'center';
    checkboxWrapper.style.gap = '5px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'highlightFilter';

    const label = document.createElement('label');
    label.htmlFor = 'highlightFilter';
    label.textContent = 'Display changes only';

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);

    // Добавляем чекбокс перед таблицей
    const tableContainer = document.querySelector('.table-wrap');
    if (tableContainer) {
        tableContainer.parentElement.insertBefore(checkboxWrapper, tableContainer);
    }

    // Обработчик изменения состояния чекбокса
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            filterTableRows(); // Фильтруем строки
        } else {
            resetTableRows(); // Сбрасываем фильтр
        }
    });

    // Отладочная информация (для проверки)
    console.log('Script loaded: Highlighted Rows Filter');
})();
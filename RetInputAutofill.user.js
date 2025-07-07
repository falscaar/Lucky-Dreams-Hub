// ==UserScript==
// @name         RetInputAutofill
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Автоматическое заполнение инпутов min dep / max bonus / amount
// @author       Retention
// @match        *://*/*/bonus_dsl*
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    let selectedBonusId = null; // Хранит ID бонуса
    let selectedFieldType = null; // Хранит тип поля (min, max, amount)

    GM_registerMenuCommand("Заполнить поля валют", fillFields);

    // Обработчик клика по полям для определения ID бонуса и типа поля
    document.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'input') {
            const fieldId = event.target.id;

            // Ищем ID бонуса, тип поля и валюту
            const match = fieldId.match(/form_(.*?)_(max|min|amount)_value_([A-Z]+)/);
            if (match) {
                selectedBonusId = match[1];  // ID бонуса (например: vip_manual_1_copy16)
                selectedFieldType = match[2]; // Тип поля (например: max, min, amount)
                console.log(`Выбран бонус ID: ${selectedBonusId}, Тип поля: ${selectedFieldType}`);
            }
        }
    });

    // Обработчик для клавиатуры
    document.addEventListener("keydown", (event) => {
        if (
            (navigator.platform.includes("Mac") && event.metaKey && event.shiftKey && event.code === "KeyF") || // Cmd+Shift+F для macOS
            (!navigator.platform.includes("Mac") && event.altKey && event.shiftKey && event.code === "KeyF")    // Alt+Shift+F для Windows
        ) {
            event.preventDefault(); // Предотвращает выполнение стандартного действия
            fillFields(); // Вызываем функцию автозаполнения
        }
    });

    // Объявляем объект matches до извлечения данных из буфера обмена
    const matches = {};

    function fillFields() {
        navigator.clipboard.readText().then((clipboardData) => {
            console.log("Буфер обмена:", clipboardData);

            if (!clipboardData) {
                console.log("Буфер обмена пуст!");
                return;
            }

// Заменяем все вхождения DOGE на DOG в данных буфера обмена
            clipboardData = clipboardData.replace(/\bDOGE\b/g, 'DOG');
            console.log("После замены DOGE на DOG:", clipboardData);

            // Считываем и обрабатываем данные из буфера обмена для валют
            const allowedCurrencies = ["BTC", "BCH", "ETH", "LTC", "USDC", "USDT", "XRP", "BNB", "ADA", "TRX", "DOG", "EUR", "USD", "CHF", "AUD", "CAD", "NZD", "NOK", "ZAR", "INR"];
            const regex = /([\d.]+)\s+([A-Z]+)\s+\(DSL:\s*([\d.]+)\s+([A-Z]+)\)/g;
            let match;

            while ((match = regex.exec(clipboardData)) !== null) {
                console.log("Найдено совпадение:", match);
                const value = match[3]; // Второе числовое значение (в скобках)
                const currency = match[4]; // Валюта
                if (allowedCurrencies.includes(currency)) {
                    matches[currency] = value;
                }
            }

            console.log("Сопоставленные валюты и значения из буфера обмена:", matches);

            // Если значение USDT существует, рассчитываем другие валюты
            if (matches["USDT"]) {
                const usdtValue = parseFloat(matches["USDT"]);

                // Добавляем новые валюты с расчетом значений на основе USDT
                const calculatedValues = {
                    EUR: usdtValue * 1,
                    USD: usdtValue * 1,
                    CHF: usdtValue * 1,
                    CAD: usdtValue * 1,
                    AUD: usdtValue * 1,
                    NZD: usdtValue * 1,
                    NOK: usdtValue * 10,
                    ZAR: usdtValue * 20,
                    INR: usdtValue <= 30 ? 500 : usdtValue * 100
                };

                // Добавляем рассчитанные валюты в matches
                Object.keys(calculatedValues).forEach((currency) => {
                    matches[currency] = calculatedValues[currency];
                    console.log(`Добавлено значение для ${currency}:`, calculatedValues[currency]);
                });
            } else {
                console.log("USDT не найдено в буфере обмена.");
            }

            console.log("Обновленный объект matches:", matches);

            if (Object.keys(matches).length === 0) {
                console.log("Не удалось найти подходящие данные для заполнения.");
                return;
            }

            // Пытаемся заполнить поля
            let filledCount = 0;

            allowedCurrencies.forEach((currency) => {
                // Если тип поля и ID бонуса совпадают, то заполняем только эти поля
                if (selectedBonusId && selectedFieldType) {
                    const inputFields = document.querySelectorAll(`input[id*="form_${selectedBonusId}_${selectedFieldType}_value_${currency}"]`);
                    inputFields.forEach((inputField) => {
                        if (inputField && matches[currency]) {
                            console.log(`Заполняем поле для ${currency}:`, matches[currency]);
                            inputField.value = matches[currency];
                            inputField.dispatchEvent(new Event('input', { bubbles: true }));
                            filledCount++;
                        } else {
                            console.log(`Поле для ${currency} не найдено или нет данных.`);
                        }
                    });
                }
            });

            if (filledCount > 0) {
                // alert(`Успешно заполнено ${filledCount} полей.`);
            } else {
                console.log("Не удалось найти подходящие поля min/max/amount для заполнения.");
            }
        }).catch((err) => {
            console.error("Ошибка чтения буфера обмена:", err);
        });
    }
})();

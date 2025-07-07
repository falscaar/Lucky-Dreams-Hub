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

    let selectedBonusId = null;
    let selectedFieldType = null;

    // Обработчик клика по input — для выбора бонуса и типа поля
    document.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'input') {
            const fieldId = event.target.id;
            const match = fieldId.match(/form_(.*?)_(max|min|amount)_value_([A-Z]+)/);
            if (match) {
                selectedBonusId = match[1];
                selectedFieldType = match[2];
                console.log(`RetInputAutofill: выбран бонус ID: ${selectedBonusId}, тип поля: ${selectedFieldType}`);
            }
        }
    });

    // Обработчик клавиатуры для вызова autofill
    document.addEventListener("keydown", (event) => {
        if (
            (navigator.platform.includes("Mac") && event.metaKey && event.shiftKey && event.code === "KeyF") ||
            (!navigator.platform.includes("Mac") && event.altKey && event.shiftKey && event.code === "KeyF")
        ) {
            event.preventDefault();
            fillFields();
        }
    });

    const matches = {};

    async function fillFields() {
        try {
            const clipboardData = await navigator.clipboard.readText();
            console.log("RetInputAutofill: Буфер обмена:", clipboardData);

            if (!clipboardData) {
                console.log("RetInputAutofill: Буфер обмена пуст!");
                return;
            }

            let data = clipboardData.replace(/\bDOGE\b/g, 'DOG');
            console.log("RetInputAutofill: После замены DOGE на DOG:", data);

            const allowedCurrencies = ["BTC", "BCH", "ETH", "LTC", "USDC", "USDT", "XRP", "BNB", "ADA", "TRX", "DOG", "EUR", "USD", "CHF", "AUD", "CAD", "NZD", "NOK", "ZAR", "INR"];
            const regex = /([\d.]+)\s+([A-Z]+)\s+\(DSL:\s*([\d.]+)\s+([A-Z]+)\)/g;
            let match;

            // Очищаем matches перед новым заполнением
            Object.keys(matches).forEach(k => delete matches[k]);

            while ((match = regex.exec(data)) !== null) {
                console.log("RetInputAutofill: Найдено совпадение:", match);
                const value = match[3];
                const currency = match[4];
                if (allowedCurrencies.includes(currency)) {
                    matches[currency] = value;
                }
            }

            if (matches["USDT"]) {
                const usdtValue = parseFloat(matches["USDT"]);
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
                Object.keys(calculatedValues).forEach((currency) => {
                    matches[currency] = calculatedValues[currency];
                    console.log(`RetInputAutofill: Добавлено значение для ${currency}:`, calculatedValues[currency]);
                });
            } else {
                console.log("RetInputAutofill: USDT не найдено в буфере обмена.");
            }

            console.log("RetInputAutofill: Обновленный объект matches:", matches);

            if (Object.keys(matches).length === 0) {
                console.log("RetInputAutofill: Нет подходящих данных для заполнения.");
                return;
            }

            let filledCount = 0;

            allowedCurrencies.forEach((currency) => {
                if (selectedBonusId && selectedFieldType) {
                    const inputFields = document.querySelectorAll(`input[id*="form_${selectedBonusId}_${selectedFieldType}_value_${currency}"]`);
                    inputFields.forEach((inputField) => {
                        if (inputField && matches[currency]) {
                            inputField.value = matches[currency];
                            inputField.dispatchEvent(new Event('input', { bubbles: true }));
                            filledCount++;
                        }
                    });
                }
            });

            if (filledCount === 0) {
                console.log("RetInputAutofill: Не удалось заполнить поля.");
            } else {
                console.log(`RetInputAutofill: Заполнено полей: ${filledCount}`);
            }
        } catch (err) {
            console.error("RetInputAutofill: Ошибка при чтении буфера обмена или заполнении:", err);
        }
    }

    // Для LuckyHub этот модуль — функция без автоматического вызова fillFields,
    // fillFields вызывается по сочетанию клавиш или через UI хаба, если надо.
})();

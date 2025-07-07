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

    function waitForInputFields(callback) {
        const checkInterval = setInterval(() => {
            const exampleInput = document.querySelector('input[id^="form_"][id*="_value_"]');
            if (exampleInput) {
                clearInterval(checkInterval);
                callback();
            }
        }, 300);
    }

    function start() {
        let selectedBonusId = null;
        let selectedFieldType = null;

        GM_registerMenuCommand("Заполнить поля валют", fillFields);

        document.addEventListener('click', (event) => {
            if (event.target.tagName.toLowerCase() === 'input') {
                const fieldId = event.target.id;
                const match = fieldId.match(/form_(.*?)_(max|min|amount)_value_([A-Z]+)/);
                if (match) {
                    selectedBonusId = match[1];
                    selectedFieldType = match[2];
                    console.log(`Выбран бонус ID: ${selectedBonusId}, Тип поля: ${selectedFieldType}`);
                }
            }
        });

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

        function fillFields() {
            navigator.clipboard.readText().then((clipboardData) => {
                console.log("Буфер обмена:", clipboardData);

                if (!clipboardData) {
                    console.log("Буфер обмена пуст!");
                    return;
                }

                clipboardData = clipboardData.replace(/\bDOGE\b/g, 'DOG');
                console.log("После замены DOGE на DOG:", clipboardData);

                const allowedCurrencies = ["BTC", "BCH", "ETH", "LTC", "USDC", "USDT", "XRP", "BNB", "ADA", "TRX", "DOG", "EUR", "USD", "CHF", "AUD", "CAD", "NZD", "NOK", "ZAR", "INR"];
                const regex = /([\d.]+)\s+([A-Z]+)\s+\(DSL:\s*([\d.]+)\s+([A-Z]+)\)/g;
                let match;

                while ((match = regex.exec(clipboardData)) !== null) {
                    console.log("Найдено совпадение:", match);
                    const value = match[3];
                    const currency = match[4];
                    if (allowedCurrencies.includes(currency)) {
                        matches[currency] = value;
                    }
                }

                console.log("Сопоставленные валюты и значения из буфера обмена:", matches);

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

                let filledCount = 0;

                allowedCurrencies.forEach((currency) => {
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
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        waitForInputFields(start);
    } else {
        document.addEventListener('DOMContentLoaded', () => waitForInputFields(start));
    }
})();

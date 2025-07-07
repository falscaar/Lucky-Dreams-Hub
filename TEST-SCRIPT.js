// ==UserScript==
// @name         Красный мерцающий прямоугольник
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет красный мерцающий прямоугольник вверху экрана
// @author       GPT
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.top = '0';
    box.style.left = '0';
    box.style.width = '100%';
    box.style.height = '30px';
    box.style.backgroundColor = 'red';
    box.style.zIndex = '999999';
    box.style.opacity = '1';
    box.style.pointerEvents = 'none'; // чтобы не мешал кликам

    document.body.appendChild(box);

    // Мерцание
    setInterval(() => {
        box.style.opacity = (box.style.opacity === '1') ? '0' : '1';
    }, 500); // каждые 500 мс
})();

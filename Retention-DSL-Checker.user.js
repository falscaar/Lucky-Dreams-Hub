// ==UserScript==
// @name         Retention DSL Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  dsl
// @author       LD Retention
// @include      *backend/bonus_dsl*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

//                                 EXCLUSIONS !!!!!! PLEASE ADD BONUS IDs THE SAME WAY THEY ADDED BELOW
    const exclusionsByHost = {
        'luckydreams.casino-backend.com': ['retention_xsell_reg1', 'retention_xsell_reg2'],
        'letslucky.casino-backend.com': ['retention_testID', 'retention_testtestID'],
        'justcasino.casino-backend.com': ['retention_xsell_reg1', 'retention_xsell_reg2'],
        'lukki.casino-backend.com': ['retention_testID', 'retention_testtestID'],
        'luckyones.casino-backend.com': ['retention_testID', 'retention_testtestID'],
        'vegasnow.casino-backend.com': ['retention_testID', 'retention_testtestID'],
    };

    // current
    const currentHost = location.hostname;
    const currentExclusions = exclusionsByHost[currentHost] || [];

    const extractParameter = (liList, keyword, opts = {}) => {
        const { startsWith = true, containsIdSuffix = null } = opts;
        for (const li of liList) {
            const div = li.querySelector('div');
            if (!div) continue;
            const text = div.textContent.trim();
            const identifierMatch = div.textContent.match(/Input with identifier: (.*?)\)/);
            const identifier = identifierMatch?.[1] || '';

            if ((startsWith ? text.startsWith(keyword) : text.includes(keyword))) {
                if (containsIdSuffix) {
                    const suffixes = Array.isArray(containsIdSuffix) ? containsIdSuffix : [containsIdSuffix];
                    const matched = suffixes.some(suffix => identifier.endsWith(suffix));
                    if (!matched) continue;
                }
                return text;
            }
        }
        return '';
    };

    const extractBonusPercent = (text) => {
        const match = text.match(/(?:%\s*(\d{1,3}(?:\.\d+)?)|(\d{1,3}(?:\.\d+)?)\s*%)/);
        return match ? parseFloat(match[1] || match[2]) : null;
    };

    const extractUpToAmount = (title) => {
        const match = title.match(/up to[^\d]*(\d{1,5})/i);
        return match ? parseInt(match[1], 10) : null;
    };

    const extractEURamount = (maxBlockText) => {
        const match = maxBlockText.match(/([\d,]+\.\d{2})\s*EUR/);
        if (match) {
            const normalized = match[1].replace(/,/g, '');
            return parseFloat(normalized);
        }
        return null;
    };

    const isMissingMaxBlock = (text) => {
        return text.trim() === 'Maximum amount per currency' ||
               /Maximum amount per currency\s*\(Input with identifier:.*?_max\)/.test(text);
    };

    const errorDefinitions = [
        { code: 'Check bonus code (dot)', test: b => {
            const codeMatch = b.visible.code.match(/Bonus code:\s*\[(.*?)\]/);
            return codeMatch && codeMatch[1].includes('.');
        }},
        { code: 'Empty title', test: b => b.visible.title.startsWith('Title:') && b.visible.title.trim().match(/^Title:\s*(\(Input|$)/) },
        { code: 'Missing bonus code', test: b => b.visible.code.includes('Bonus code: false') },
        { code: 'Missing duration', test: b => b.visible.duration === 'Duration' || /^Duration\s*\(Input/.test(b.visible.duration) },
        { code: 'Missing FS Duration', test: b => b.visible.fs_duration === 'Duration' || /^Duration\s*\(Input/.test(b.visible.fs_duration) },
        { code: 'Missing result duration', test: b => b.visible.result_duration === 'Duration' || /^Duration\s*\(Input/.test(b.visible.result_duration) },
        { code: 'Missing wager', test: b => b.visible.wager.includes('Wager Multiplier: 0') },
        { code: 'Missing wager in result', test: b => b.visible.result_wager.includes('Wager Multiplier: 0') },
        { code: 'Missing minimal deposit amount', test: b => !b.visible.min.includes('Min value:') },
        { code: 'Missing maximum bonus amount', test: b => isMissingMaxBlock(b.visible.max) },
        { code: 'Missing FS activation duration', test: b => b.visible.activation_duration === 'Activation duration' || /^Activation duration\s*\(Input/.test(b.visible.activation_duration) },
        { code: 'Check validity dates', test: b => b.visible.availability && (b.visible.availability.includes('from') ^ b.visible.availability.includes('until')) },
        { code: 'Bonus percentage mismatch', test: b => {
            const titlePct = extractBonusPercent(b.visible.title);
            const amountPct = extractBonusPercent(b.visible.amount);
            return titlePct !== null && amountPct !== null && Math.round(titlePct) !== Math.round(amountPct);
        }},
        { code: 'Maximum bonus amount mismatch', test: b => {
            if (isMissingMaxBlock(b.visible.max)) return false;
            const upToVal = extractUpToAmount(b.visible.title);
            const eurVal = extractEURamount(b.visible.max);
            return upToVal !== null && eurVal !== null && Math.abs(upToVal - eurVal) > 1;
        }}
    ];

    function scanBonuses() {
        const bonusRows = [...document.querySelectorAll('tr.dsl-title-row')];
        console.log(`🔍 Найдено бонусов: ${bonusRows.length}`);
        const errors = [];

        for (let i = 0; i < bonusRows.length; i++) {
            const row = bonusRows[i];
            const trigger = row.querySelector('td')?.textContent.trim();
            const tdList = row.querySelectorAll('td');
            const identifier = tdList[tdList.length - 1]?.textContent.trim() || '';

            const next = row.nextElementSibling;
            if (!next) continue;

            const tds = next.querySelectorAll('td');
            const type = tds[0]?.textContent.trim();
            const valid = tds[1]?.textContent.trim().toLowerCase() === 'yes';

            const isDeposit = trigger === 'Deposit';
            const isCoupon = trigger === 'Coupon Input';

            if (!(valid && /retention/i.test(identifier) && (isDeposit || isCoupon))) continue;

            const liList = [];
            let walker = next;
            while (walker && !walker.classList.contains('dsl-title-row')) {
                liList.push(...walker.querySelectorAll('li'));
                walker = walker.nextElementSibling;
            }

            const visible = {
                title: extractParameter(liList, 'Title:'),
                code: extractParameter(liList, 'Bonus code:'),
                duration: extractParameter(liList, 'Duration', { containsIdSuffix: '_duration' }),
                fs_duration: extractParameter(liList, 'Duration', { containsIdSuffix: '_fs_duration' }),
                amount: extractParameter(liList, 'Amount'),
                wager: extractParameter(liList, 'Wager Multiplier:', { containsIdSuffix: '_wager' }),
                result_wager: extractParameter(liList, 'Wager Multiplier:', { containsIdSuffix: '_result_wager' }),
                result_duration: extractParameter(liList, 'Duration', { containsIdSuffix: '_result_duration' }),
                activation_duration: extractParameter(liList, 'Activation duration', { containsIdSuffix: ['_act_duration', '_activation_duration'] }),
                availability: extractParameter(liList, 'Available'),
                min: extractParameter(liList, 'Min value:'),
                max: extractParameter(liList, 'Maximum amount per currency')
            };

            const bonus = { identifier, trigger, type, visible, liList };

            const couponErrorCodes = [
                'Empty title',
                'Missing bonus code',
                'Missing duration',
                'Missing FS activation duration',
                'Missing result duration',
                'Missing wager in result',
                'Check validity dates',
                'Check bonus code (dot)'
            ];

            for (const def of errorDefinitions) {
                if (isDeposit || (isCoupon && couponErrorCodes.includes(def.code))) {
                    if (def.test(bonus)) {
                        if (!currentExclusions.includes(identifier)) {
                        errors.push(`${identifier} / ${def.code}`);
                        console.warn(`⚠️ ${identifier}: ${def.code}`);
}
                    }
                }
            }
        }

        return errors;
    }

    function showWarnings(errors) {
        if (!errors.length) return;

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '40px';
        container.style.left = '10px';
        container.style.background = 'yellow';
        container.style.border = '2px solid red';
        container.style.padding = '6px 10px';
        container.style.zIndex = 99999;
        container.style.fontSize = '14px';
        container.style.fontWeight = 'bold';
        container.style.cursor = 'pointer';
        container.textContent = `⚠ ${errors.length} bonus issues`;

        const dropdown = document.createElement('ul');
        dropdown.style.display = 'none';
        dropdown.style.listStyle = 'none';
        dropdown.style.padding = '10px';
        dropdown.style.margin = 0;
        dropdown.style.background = 'white';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = 0;
        dropdown.style.maxHeight = '400px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.overflowX = 'auto';
        dropdown.style.whiteSpace = 'nowrap';
        dropdown.style.minWidth = '500px';
        dropdown.style.fontWeight = 'normal';

        errors.forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                const id = err.split(' / ')[0];
                const rows = [...document.querySelectorAll('tr.dsl-title-row')];
                const match = rows.find(r => r.textContent.includes(id));
                if (match) match.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            dropdown.appendChild(li);
        });

        container.appendChild(dropdown);
        container.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.body.appendChild(container);
    }

    setTimeout(() => {
        const errors = scanBonuses();
        showWarnings(errors);
    }, 1000);
})();

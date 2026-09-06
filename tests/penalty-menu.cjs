// Run with Node and Playwright available (NODE_PATH may point to its installation).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const page = await browser.newPage();
        await page.setContent(`<input name="pattern1"><select id="comment" name="comment"
            onchange="window.changes = (window.changes || 0) + 1">
            <option value="">NONE</option><option value="RET-BF">RET (before finishing)</option>
            <option value="ZFP">ZFP</option><option value="BYE">BYE</option>
            <option value="CP">Custom Penalty</option><option value="RET-AF">RET (after finishing)</option>
            <option value="ARB">ARB</option></select>`);
        await page.locator('#comment').selectOption('RET-BF');
        await page.evaluate(() => { window.changes = 0; });
        await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, '../scripts/rn-scoring-helper'), 'utf8') });
        const read = () => page.locator('#comment').evaluate(select => ({
            value: select.value,
            codes: Array.from(select.options, o => o.value),
            enabled: Array.from(select.options).filter(o => !o.disabled).map(o => o.value),
            changes: window.changes
        }));
        let state = await read();
        assert.equal(await page.locator('#comment option').evaluateAll(options =>
            options.every(option => getComputedStyle(option).display !== 'none')), true);
        assert.equal(await page.locator('#comment').evaluate(select => getComputedStyle(select).color), 'rgb(36, 93, 143)');
        assert.deepEqual(state.codes, ['', 'ARB', 'BYE', 'CP', 'RET-AF', 'RET-BF', 'ZFP']);
        assert.deepEqual(state.enabled, ['', 'ARB', 'CP', 'RET-BF', 'ZFP']);
        assert.equal(state.value, 'RET-BF');
        assert.equal(state.changes, 0);
        await page.locator('#comment').evaluate(select => { select.value = 'BYE'; });
        state = await read();
        assert.deepEqual(state.enabled, ['', 'ARB', 'BYE', 'CP', 'ZFP']);
        assert.equal(state.value, 'BYE');
        await page.locator('#comment').selectOption('CP');
        state = await read();
        assert.deepEqual(state.enabled, ['', 'ARB', 'CP', 'ZFP']);
        assert.equal(state.changes, 1);
        assert.equal(await page.locator('option[value="CP"]').textContent(), 'Custom Penalty');
        await page.locator('#comment').evaluate(select => {
            select.outerHTML = '<select id="comment"><option value="ZFP">ZFP</option><option value="BYE" selected>BYE</option><option value="">NONE</option><option value="ARB">ARB</option></select>';
        });
        state = await read();
        assert.deepEqual(state.codes, ['', 'ARB', 'BYE', 'ZFP']);
        assert.equal(state.value, 'BYE');
        assert.ok(state.enabled.includes('BYE'));
        await page.locator('#comment').evaluate(select => { select.value = ''; });
        assert.deepEqual((await read()).enabled, ['', 'ARB', 'ZFP']);
        const script = fs.readFileSync(path.join(__dirname, '../scripts/rn-scoring-helper'), 'utf8');
        const countCodes = ['DNC', 'DNS', 'OCS', 'UFD', 'BFD', 'BFD-DNE', 'NSC', 'DNF', 'RET', 'RET-BF', 'RET-AF', 'DSQ', 'DNE', 'DGM'];
        for (const a53 of [false, true]) {
            const defaultsPage = await browser.newPage();
            await defaultsPage.setContent(`<select id="comment" onchange="document.querySelector('[name=penalty_basis]').value='F3'">
                ${['', ...countCodes, 'SCP', 'CP', 'CPT', 'RDG', 'TIE', 'TLE', 'ARB', 'ZFP', 'BYE', 'AVG-ALL', 'AVG-TD', 'RDG-AVG'].map(code => `<option value="${code}">${code || 'NONE'}</option>`).join('')}
                </select><select name="penalty_basis">${['', 'F1', 'F2', 'F3', 'C1', 'C2'].map(code => `<option value="${code}">${code || 'Competitors +1'}</option>`).join('')}</select>`);
            await defaultsPage.locator('[name=penalty_basis]').selectOption('F2');
            await defaultsPage.addScriptTag({ content: script
                .replace('let useAppendixA53 = false;', `let useAppendixA53 = ${a53};`)
                .replace('const penaltyBasisOverrides = {};', "const penaltyBasisOverrides = { DNF: 'F1', RET: 'bad', BAD: 'C1' };") });
            const basis = () => defaultsPage.locator('[name=penalty_basis]').inputValue();
            assert.equal(await basis(), 'F2', 'Preserve existing basis on load');
            for (const code of countCodes) {
                // Hidden codes remain assignable by RN; dispatch change for a new entry.
                await defaultsPage.locator('#comment').evaluate((select, code) => {
                    select.value = code;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }, code);
                assert.equal(await basis(), code === 'DNF' ? 'F1' : a53 && code !== 'DNC' ? 'C1' : '', code);
            }
            await defaultsPage.locator('[name=penalty_basis]').selectOption('C2');
            await defaultsPage.evaluate(() => document.body.append(document.createElement('div')));
            assert.equal(await basis(), 'C2', 'Manual override survives DOM updates');
            for (const code of ['', 'SCP', 'CP', 'CPT', 'RDG', 'TIE', 'TLE', 'ARB', 'ZFP', 'BYE', 'AVG-ALL', 'AVG-TD', 'RDG-AVG']) {
                await defaultsPage.locator('#comment').evaluate((select, code) => {
                    select.value = code;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }, code);
                assert.equal(await basis(), '', 'Clear stale hidden basis: ' + code);
            }
            await defaultsPage.locator('#comment').evaluate(select => { select.outerHTML = select.outerHTML; });
            await defaultsPage.locator('#comment').selectOption('DNS');
            assert.equal(await basis(), a53 ? 'C1' : '', 'Replacement menu gets defaults');
            await defaultsPage.locator('#rn-helper-a53').setChecked(!a53);
            assert.equal(await basis(), !a53 ? 'C1' : '', 'Switch updates current code');
            await defaultsPage.locator('#comment').selectOption('DNC');
            assert.equal(await basis(), '', 'DNC stays Competitors +1');
            await defaultsPage.locator('#comment').selectOption('DNF');
            assert.equal(await basis(), 'F1', 'Switch preserves configured override');
            await defaultsPage.locator('#rn-helper-a53').setChecked(a53);
            assert.equal(await basis(), 'F1', 'Switch back preserves configured override');
            assert.equal(await defaultsPage.locator('#rn-helper-a53').count(), 1);
            await defaultsPage.close();
        }
        const focusPage = await browser.newPage();
        await focusPage.setContent(`<input name="pattern1"><span id="move-selected"> [<a href="#2">Move Selected</a>]</span><br><input id="edit">
            <select id="comment"><option value="">NONE</option></select>
            <select name="first_list"><option value="a">A</option><option value="b">B</option></select>
            <select name="ordered_list_0"><option value="temp">Placeholder</option></select>`);
        await focusPage.locator('#edit').focus();
        await focusPage.addScriptTag({ content: script });
        assert.equal(await focusPage.locator('#move-selected').evaluate(link =>
            link.nextElementSibling.querySelector('input')?.id), 'rn-helper-autofocus');
        const positions = await focusPage.evaluate(() => {
            const field = document.querySelector('[name=pattern1]').getBoundingClientRect();
            const link = document.querySelector('#move-selected').getBoundingClientRect();
            const toggle = document.querySelector('#rn-helper-autofocus').getBoundingClientRect();
            return { beside: link.left >= field.right && link.top < field.bottom,
                below: toggle.top >= field.bottom };
        });
        assert.deepEqual(positions, { beside: true, below: true });
        assert.equal(await focusPage.locator('#rn-helper-autofocus').evaluate(toggle =>
            getComputedStyle(toggle.parentElement).color), 'rgb(36, 93, 143)');
        const settle = () => focusPage.evaluate(() => new Promise(resolve => setTimeout(resolve, 30)));
        const active = () => focusPage.evaluate(() => document.activeElement.id || document.activeElement.name);
        await settle();
        assert.equal(await active(), 'edit', 'Startup preserves existing focus');
        await focusPage.evaluate(() => {
            document.body.append(document.createElement('div'));
            document.querySelector('#edit').style.width = '150px';
        });
        await settle();
        assert.equal(await active(), 'edit', 'Unrelated changes do not grab focus');
        const transfer = direction => focusPage.evaluate(direction => {
            const left = document.querySelector('[name=first_list]');
            const right = document.querySelector('[name=ordered_list_0]');
            if (direction === 'score') right.append(left.options[0]);
            else left.append(Array.from(right.options).find(option => option.value !== 'temp'));
        }, direction);
        await transfer('score');
        await settle();
        assert.equal(await active(), 'pattern1', 'Scoring returns focus');
        await focusPage.locator('#edit').focus();
        await transfer('unscore');
        await settle();
        assert.equal(await active(), 'edit', 'Unscoring preserves focus');
        await focusPage.locator('#rn-helper-autofocus').uncheck();
        await focusPage.locator('#edit').focus();
        await transfer('score');
        await settle();
        assert.equal(await active(), 'edit', 'Switch disables scoring focus');
        await focusPage.locator('#rn-helper-autofocus').check();
        await focusPage.locator('#edit').focus();
        await focusPage.evaluate(() => {
            const right = document.querySelector('[name=ordered_list_0]');
            right.append(right.options[0]);
        });
        await settle();
        assert.equal(await active(), 'edit', 'Reordering preserves focus');
        await transfer('score');
        await settle();
        assert.equal(await active(), 'pattern1', 'Switch re-enables scoring focus');
        await focusPage.close();
        console.log('Passed: focused scoring, unscoring, unrelated edits, reordering, startup focus, and auto-focus switch.');
        console.log('Passed: standard/A5.3 defaults, override precedence, invalid overrides, manual edits, stale basis clearing, and replacement menus.');
        console.log('Passed: sorting, filtering, selected-code visibility, programmatic selection, original handler/labels, and menu replacement.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

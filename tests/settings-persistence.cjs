// Run with Node and Playwright available, as for penalty-menu.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const script = fs.readFileSync(path.join(__dirname, '../scripts/rn-scoring-helper'), 'utf8');
    const html = `<input name="pattern1"><input id="edit">
        <select id="comment"><option value="DNS">DNS</option><option value="DNC">DNC</option></select>
        <select name="penalty_basis"><option value="">Competitors +1</option><option value="F1" selected>Finishers +1</option><option value="C1">Checkins +1</option></select>
        <select name="first_list"><option value="a">A</option></select>
        <select name="ordered_list_0"><option value="temp">Placeholder</option></select>`;
    try {
        const context = await browser.newContext();
        await context.route('http://rn.test/**', route => route.fulfill({ contentType: 'text/html', body: html + '<script>' + script + '</script>' }));
        const page = await context.newPage();
        await page.goto('http://rn.test/scoring?race=1');
        const choices = async p => [await p.locator('#rn-helper-a53').isChecked(), await p.locator('#rn-helper-autofocus').isChecked()];
        assert.deepEqual(await choices(page), [false, true], 'First-use defaults');
        await page.locator('#rn-helper-a53').check();
        await page.locator('#rn-helper-autofocus').uncheck();
        await page.reload();
        assert.deepEqual(await choices(page), [true, false], 'Both choices survive an actual reload');
        assert.equal(await page.locator('[name=penalty_basis]').inputValue(), 'F1', 'Restoring A5.3 does not overwrite an existing entry');
        await page.locator('#comment').selectOption('DNC');
        assert.equal(await page.locator('[name=penalty_basis]').inputValue(), '');
        await page.locator('#comment').selectOption('DNS');
        assert.equal(await page.locator('[name=penalty_basis]').inputValue(), 'C1', 'Restored A5.3 applies to new code selections');
        await page.locator('#edit').focus();
        await page.evaluate(() => document.querySelector('[name=ordered_list_0]').append(document.querySelector('[name=first_list]').options[0]));
        await page.waitForTimeout(30);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'edit', 'Restored autofocus off preserves corrections');
        const next = await context.newPage();
        await next.goto('http://rn.test/scoring?race=2');
        assert.deepEqual(await choices(next), [true, false], 'Saved choices survive navigation and a new page');
        await next.locator('#rn-helper-a53').uncheck();
        await next.locator('#rn-helper-autofocus').check();
        await next.reload();
        assert.deepEqual(await choices(next), [false, true], 'Reverse choices are saved too');
        await next.evaluate(() => {
            localStorage.setItem('rn-scoring-helper.useAppendixA53', 'invalid');
            localStorage.setItem('rn-scoring-helper.autoFocusQuickFind', 'invalid');
        });
        await next.reload();
        assert.deepEqual(await choices(next), [false, true], 'Invalid saved values fall back to defaults');
        await context.close();

        const blocked = await browser.newContext();
        await blocked.route('http://rn.test/**', route => route.fulfill({ contentType: 'text/html', body: html + '<script>' + script + '</script>' }));
        await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
        const blockedPage = await blocked.newPage();
        const errors = [];
        blockedPage.on('pageerror', error => errors.push(error));
        await blockedPage.goto('http://rn.test/scoring');
        assert.deepEqual(await choices(blockedPage), [false, true]);
        await blockedPage.locator('#rn-helper-a53').check();
        await blockedPage.locator('#rn-helper-autofocus').uncheck();
        assert.deepEqual(await choices(blockedPage), [true, false], 'Switches still work without storage');
        assert.equal(await blockedPage.locator('[name=penalty_basis]').inputValue(), 'C1');
        assert.deepEqual(errors, [], 'Blocked storage does not break the script');
        await blocked.close();
        console.log('Passed: defaults, actual reloads, navigation, saved true/false, restored basis/focus behavior, invalid values, and unavailable storage.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

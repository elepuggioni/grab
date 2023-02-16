const puppeteer = require('puppeteer');
const path = require('path');

const Config = require('./config/config.js').Config;

const io = require('./utils/io.js');
const setup = require('./utils/setup.js');
const logs = require('./utils/logs.js');

const youtube = require('./extractor/youtube.js');

(async function main() {
    let settings = Config.setup();

    const ublock = path.join(process.cwd(), './extensions/ublock');
    const browser = await puppeteer.launch({
        headless: 'chrome',
        executablePath: 'google-chrome-stable',
        args: [
            `--disable-extensions-except=${ublock}`,
            `--load-extension=${ublock}`,
        ]
    });

    const page = await browser.newPage();
    logs.write("Launched browser in headless mode...")

    await page.setRequestInterception(true);
    page.on('request', async request => {
        // abort requests coming from blacklisted domains
        let blockedHosts = setup.readBlockedHosts();
        let requestUrl = new URL(request.url());

        if (blockedHosts[requestUrl.hostname]) {
            await request.abort();
        }
        else {
            await request.continue();
        }
    });

    //print al console messages
    page.on('console', message => logs.browser(message.type().toUpperCase(), message.text(), '\n'))
        .on('pageerror', message => logs.browser('ERROR', message.text(), '\n'))
        .on('response', response => logs.browser('RESPONSE', response.status(), response.url(), '\n'))
        .on('requestfailed', request => logs.browser('REQUEST FAIL', request.failure().errorText, request.url(), '\n'));

    await page.goto(settings.url, { waitUntil: 'networkidle0' });

    let result = await youtube.cazzo(page, settings);

    io.write('app/src/playlist.json', result);

    await browser.close();
})();
const puppeteer = require('puppeteer');
const path = require('path');

const logs = require('./utils/logs.js');
const io = require('./utils/io.js');
const handler = require('./config/handler.js');

(async function main() {
    let extractor = cazzo();

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
        let blockedHosts = io.readBlockedHosts();
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

    await page.goto(extractor.url, { waitUntil: 'networkidle0' });
    
    extractor.set_page(page);
    let result = await extractor.extract();

    io.writePlaylist(result);

    await browser.close();
})();

function cazzo(){
    logs.write('Setting up...');
    // process.argv.slice(2, 3)[0] to get cli arguments

    let url = process.argv.slice(2, 3)[0];
    if(url === undefined){
        logs.fatal("Missing URL parameter.");
    }

    // todo check url is valid 

    let h = handler.get_handler(
        new URL(url),
        process.argv.slice(3, 4)[0]
    );

    logs.debug(h);
    return h;
}
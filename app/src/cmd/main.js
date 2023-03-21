const puppeteer = require('puppeteer');

const logs = require('./utils/logs.js');
const io = require('./utils/io.js');
const handler = require('./config/handler.js');

(async function main() {
    let extractor = setup();

    if(extractor.needs_browser){
        const browser = await puppeteer.launch({
            headless: 'false',
            executablePath: 'google-chrome-stable',
        });

        const page = await browser.newPage();
        logs.write("Launched browser in headless mode...")

        page.on('console', message => logs.browser(message.type().toUpperCase(), message.text(), '\n'))
            .on('pageerror', message => logs.browser('ERROR', message.text(), '\n'))
            .on('response', response => logs.browser('RESPONSE', response.status(), response.url(), '\n'))
            .on('requestfailed', request => logs.browser('REQUEST FAIL', request.failure().errorText, request.url(), '\n'));
        
        extractor.set_browser(browser);
        extractor.set_page(page);

        let result = await extractor.extract();
        io.writePlaylist(result);

        await browser.close();
    }
    else{
        let result = await extractor.extract();
        io.writePlaylist(result);
    }
})();

/**
 * setup initial config and extractor
 * @returns { <E extends Extractor> }
 */
function setup(){
    logs.write('Setting up...');

    let url = process.argv.slice(2, 3)[0];
    if(url === undefined){
        logs.fatal("Missing URL parameter.");
    }

    // todo check url is valid 

    //initialize extractor here
    let extractor = handler.get_handler(
        new URL(url),
        process.argv.slice(3, 4)[0]
    );

    logs.debug(extractor);
    return extractor;
}
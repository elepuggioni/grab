const logs = require('./logs.js');
/**
 * 
 * @param {Boolean} logs enable browser log redirection to console
 */
async function newPage(browser, logging){
    if(browser === undefined){
        logs.fatal('Error at utils/page.js', 'newPage() browser argument is undefined.');
    }

    const page = await browser.newPage();
    if(logging){
        page.on('console', message => logs.browser(message.type().toUpperCase(), message.text(), '\n'))
            .on('pageerror', message => logs.browser('ERROR', message.text(), '\n'))
            .on('response', response => logs.browser('RESPONSE', response.status(), response.url(), '\n'))
            .on('requestfailed', request => logs.browser('REQUEST FAIL', request.failure().errorText, request.url(), '\n'));
    }
    return page;
}

module.exports = { newPage };
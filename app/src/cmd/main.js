const puppeteer = require('puppeteer');
const path = require('path');

const config = require('./config/config.js');
const def = require('./config/def.js');

const io = require('./utils/io.js');
const setup = require('./utils/setup.js');
const log = require('./utils/log.js');
const utils = require('./utils/utils.js');
const urls = require('./utils/urls.js');

const minDuration = 60; // dont download anything shorter than this (in seconds) (to avoid ads)

(async function main(){
    // process.argv.slice(2, 3)[0] to get cli arguments

    let settings = config.Config.setup();

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
    log.write("Launched browser in headless mode...")

    await page.setRequestInterception(true);

    let streams = [];

    page.on('request', async request => {
        // abort requests coming from blacklisted domains
        let blockedHosts = setup.readBlockedHosts();
        let requestUrl = new URL(request.url());
        
        if(blockedHosts[requestUrl.hostname]) {
            await request.abort();
        }
        else{
            await request.continue();
        }
    });

    //print al console messages
    page.on('console', message => log.browser(message.type().toUpperCase(), message.text(), '\n'))
        .on('pageerror', message => log.browser('ERROR', message.text(), '\n'))
        .on('response', response => log.browser('RESPONSE', response.status(), response.url(), '\n'))
        .on('requestfailed', request => log.browser('REQUEST FAIL', request.failure().errorText, request.url(), '\n'));

    await page.goto(settings.url,{ waitUntil: 'networkidle0' });

    let check = {
        audio: false,
        video: false,
    };

    let qualities = await youtube.getAvailableQualityLevels(page);
    console.log(qualities);

    await youtube.setPlaybackQualityRange(page, qualities[0])
        .then(r => log.write(r));

    await page.waitForResponse((request) => {
            handler(request, settings)
            .then((r) => {
                if(r.ok){
                    streams.push(r.stream);
                    check[r.stream.type] = true;
                }
            });

            return check.audio && check.video;
        })
        .then(r => log.write(r));

    // get title and author
    let title = await page.title()
        .then(t => t.trimEnd());

    utils.delay(300);
    //let author = await page.$eval('a.yt-simple-endpoint.style-scope.yt-formatted-string', el => el.innerText);

    // for now take the first audio and video it finds and set it as the stuff to download
    let download = {};
    for(let stream of streams){
        if(stream.type === 'audio' && download.audio === undefined){
            download.audio = stream.url;
        }
        if(stream.type === 'video' && download.video === undefined){
            download.video = stream.url;
        }
    }

    let result = {
        title: title,
        streams: streams,
        download: download
    };

    io.write('app/src/playlist.json', result);

    await browser.close();
})();
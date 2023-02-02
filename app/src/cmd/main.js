const puppeteer = require('puppeteer');
const path = require('path');

const io = require('./utils/io.js');
const setup = require('./utils/setup.js');
const log = require('./utils/log.js');
const utils = require('./utils/utils.js');
const { title } = require('process');

const minDuration = 60; // dont download anything shorter than this (in seconds) (to avoid ads)

/**
 * @param {puppeteer.HTTPRequest} interceptedRequest 
 * @param {Config} config
 */
async function handleYoutube(interceptedRequest, config){
    // document.querySelector('#movie_player').getAvailableQualityLabels()
    // document.querySelector('#movie_player').setPlaybackQualityRange(qualitylabel)
    let url = new URL(utils.decodeUrl(interceptedRequest.url()));
    
    let result = {
        ok: false
    };

    // filter requests to find the ones containing media streams
    if (url.hostname.search('googlevideo.com') !== -1){
        let params = {};

        // parse url for params
        for(const param of url.href.split('&')){
            let s = param.split('=');
            let key = s[0];
            let value = s[1];

            if (Object.keys(params).length === 0){
                key = key.substring(key.indexOf("?") + 1);
            }
            params[key] = value;
        }

        if(parseFloat(params.dur, 10) > minDuration){
            const re = new RegExp(/range=[^&]*/);

            result = {
                ok: true,
                stream: {
                    type: params.mime.substring(0, params.mime.indexOf("/")),
                    url: url.href.replace(re, 'range=0-999999999')
                },
            }

            log.debug(params);
            log.debug(result);
        }
    }
    await interceptedRequest.continue();

    return result;
}

(async function main(){
    //get cli arguments. arguments start at 2. only accepts one argument for now, the url
    let config = {}
    config.url = process.argv.slice(2, 3)[0];
    if(config.url === undefined){
        console.log("Exited with code 1: missing url argument")
        process.exit(1);
    }

    config.audio = true;
    config.video = process.argv.slice(3, 4)[0] !== 'audio';
    
    // todo check url is valid 
    // detect site
    let domain = 'youtube';

    let handler;
    switch(domain){
        case 'youtube':
            handler = handleYoutube;
            break;
        default:
            log.fatal('Unknown domain. Exiting...')
    }

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
    //await page.setRequestInterception(true);

    log.write("Launched in headless mode...")

    let streams = [];

    page.on('request', async request => {
        // abort requests coming from blacklisted domains
        let blockedHosts = setup.readBlockedHosts();
        let requestUrl = new URL(request.url());
        
        if(blockedHosts[requestUrl.hostname]) {
            await request.abort();
        }
        else{
            await handler(request, config, streams)
                .then(r => r.ok ? streams.push(r.stream) : null)
        }
    });

    //print al console messages
    page
    .on('console', message =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      console.log(`${response.status()} ${response.url()}`))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`))

    await page.goto(config.url,{ waitUntil: 'networkidle0' });

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
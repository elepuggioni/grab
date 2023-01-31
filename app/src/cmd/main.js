const puppeteer = require('puppeteer');
const path = require('path');
const Url = require('url-parse');
const fs = require('fs');

const utils = require('./utils/utils.js');

const minDuration = 60; // dont download anything shorter than this (in seconds) (to avoid ads)
const DEBUG = true;

let blocked = [];

// true if it found the .m3u8 file
let found = {
    audio: false,
    video: false
};

// read file with blocked domains (ads)
function readHosts(){
    let hostFile = fs.readFileSync('./app/src/config/hosts.txt', 'utf8').split('\n');
    let hosts = {};
    for (var i = 0; i < hostFile.length; i++) {
        let frags = hostFile[i].split(' ');
        if (frags.length > 1 && frags[0] === '0.0.0.0') {
            hosts[frags[1].trim()] = true;
        }
    }
    return hosts;
}

function handleYoutube(interceptedRequest, audio_only){
    let url = new Url(interceptedRequest.url())
    let result = {};

    // find the right request
    if (url.hostname.search('googlevideo.com') !== -1){
        // parse url for params
        let params = {};
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
            if(
                (!found.audio && params.mime.startsWith('audio')) ||
                (!found.video && !audio_only && params.mime.startsWith('video'))
             ){
                const re = new RegExp(/range=[^&]*/);
                let newUrl = url.href.replace(re, 'range=0-999999999');
                
                let source_type = params.mime.substring(0, params.mime.indexOf("%"));
                
                if( source_type === 'audio'){
                    result.audio = newUrl;
                }else if(source_type === 'video'){
                    result.video = newUrl;
                }
                
                found[source_type] = true;

                if(DEBUG){
                    console.log(params);
                    console.log(result);
                }
            }
        }
    }

    interceptedRequest.continue();
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

    config.audio_only = process.argv.slice(3, 4)[0] === 'audio';
    
    // todo check url is valid 
    // detect site
    let domain = 'youtube';

    let handler;
    switch(domain){
        case 'youtube':
            handler = handleYoutube;
            break;
        default:
            console.log('Unknown domain. Exiting...')
            process.exit(1);
    }

    blocked = readHosts();

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
    await page.setRequestInterception(true);

    console.log("Launched in headless mode...")

    // intercept requests
    let source = {};
    page.on('request', async interceptedRequest => {
        // block requests coming from blacklisted domains
        var domain = null;
        var frags = interceptedRequest.url().split('/');
        if (frags.length > 2) {
           domain = frags[2];
        }
        // just abort if found
        if (blocked[domain] === true) {
            interceptedRequest.abort();
        }else{
            if(!found.audio || !found.video){
                let result = handler(interceptedRequest, config.audio_only);
                if(result !== null && !(Object.keys(result).length === 0)){
                    Object.assign(source, result);
                }
            }else{
                interceptedRequest.abort();
            }
        }
    });
    await page.goto(config.url,{ waitUntil: 'networkidle0' });

    // get title and author
    source.title = await page.title()
        .then(t => t.trimEnd());
    utils.delay(300);
    //source.author = await page.$eval('a.yt-simple-endpoint.style-scope.yt-formatted-string', el => el.innerText);

    fs.writeFile('app/src/playlist.json', JSON.stringify(source), 'utf8', err => {
        if (err) {
            console.error(err);
        }
    });

    await browser.close();
})();
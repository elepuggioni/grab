const log = require('../utils/log.js');
const puppeteer = require('puppeteer');

const urls = require('../utils/urls.js');

const player = '#movie_player';
const minDuration = 60;
/**
 * @param {puppeteer.HTTPRequest} interceptedRequest 
 * @param {Config} config
 */
async function handle(interceptedRequest, config){
    // document.querySelector('#movie_player').getAvailableQualityLabels()
    // document.querySelector('#movie_player').setPlaybackQualityRange(qualitylabel)
    let url = new URL(urls.decode(interceptedRequest.url()));
    
    let result = {
        ok: false
    };

    // filter requests to find the ones containing media streams
    if (url.hostname.search('googlevideo.com') !== -1){
        let params = urls.deconstruct(url.href);

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

    return result;
}

// do some mayjikk later where i can get Id from any type of yt url
function getVideoId(url){
    const re = new RegExp(/watch\?v=(.*)/);
    let u = url.match(re);
    log.write('cazzo', u[1]);
    return u[1];
}

async function getAvailableQualityLevels(page){
    return await page.evaluate(() => {
        return document.querySelector('#movie_player').getAvailableQualityLevels();
    })
}

async function setPlaybackQualityRange(page, quality){
    await page.evaluate((quality) => {
        document.querySelector('#movie_player').setPlaybackQualityRange(quality);
    }, quality);
}

function changeQuality() {
    const poll = resolve => {
        if(func()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }
    return new Promise(poll);
}

module.exports = { handle, getAvailableQualityLevels, setPlaybackQualityRange }
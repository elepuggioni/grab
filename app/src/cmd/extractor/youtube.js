const logs = require('../utils/logs.js');
const puppeteer = require('puppeteer');

const urls = require('../utils/urls.js');
const delay = require('../utils/utils.js').delay;

const minDuration = 60;

async function cazzo(page, settings){
    let done = {
        audio: false,
        video: false,
    };

    let streams = [];

    let qualities = await getAvailableQualityLevels(page);
    logs.debug("Available qualities", qualities);


    if(settings.video.download){
        await setPlaybackQualityRange(page, qualities[0]);
    }

    await page.waitForResponse((request) => {
            handle(request, settings)
            .then((r) => {
                if(r.ok){
                    streams.push(r.stream);
                    done[r.stream.type] = true;
                }
            });
            return done.audio && done.video;
        })
        .then(r => logs.write(r));

    // get title and author
    let title = await page.title()
    .then(t => t.trimEnd());

    delay(300);
    //let author = await page.$eval('a.yt-simple-endpoint.style-scope.yt-formatted-string', el => el.innerText);

    // for now take the first audio and video it finds and set it as the stuff to download
    let download = {};
    for (let stream of streams) {
        if (stream.type === 'audio' && download.audio === undefined) {
            download.audio = stream.url;
        }
        if (stream.type === 'video' && download.video === undefined) {
            download.video = stream.url;
        }
    }

    return {
        title: title,
        streams: streams,
        download: download
    };
}

/**
 * @param {puppeteer.HTTPRequest} interceptedRequest 
 */
async function handle(interceptedRequest){
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

            logs.debug(params);
            logs.debug(result);
        }
    }

    return result;
}

// do some mayjikk later where i can get Id from any type of yt url
function getVideoId(url){
    const re = new RegExp(/watch\?v=(.*)/);
    let u = url.match(re);
    logs.write('cazzo', u[1]);
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

module.exports = { cazzo }
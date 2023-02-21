const logs = require('../utils/logs.js');
const puppeteer = require('puppeteer');

const urls = require('../utils/urls.js');
const delay = require('../utils/utils.js').delay;

const minDuration = 60;

class Youtube{

    constructor(){
        super();
    }

    async extract(){
        this.qualities = await this.getAvailableQualityLevels();
        logs.debug("Available qualities", this.qualities);

        if(this.settings.video.download){
            await this.setPlaybackQualityRange(this.qualities[0]);
        }

        await this.settings.page.waitForResponse((request) => {
                this.handle(request, this.settings)
                .then((r) => {
                    if(r.ok){
                        this.streams.push(r.stream);
                        this.done[r.stream.type] = true;
                    }
                });
                return this.done.audio && this.done.video;
            })
            .then(r => logs.write(r));

        // get title and author
        this.title = await this.settings.page.title()
        .then(t => t.trimEnd());

        delay(300);
        //let author = await page.$eval('a.yt-simple-endpoint.style-scope.yt-formatted-string', el => el.innerText);

        // for now take the first audio and video it finds and set it as the stuff to download
        for (let stream of this.streams) {
            if (stream.type === 'audio' && this.downloads.audio === undefined) {
                this.downloads.audio = stream.url;
            }
            if (stream.type === 'video' && this.downloads.video === undefined) {
                this.downloads.video = stream.url;
            }
        }

        return {
            title: this.title,
            streams: this.streams,
            download: this.downloads
        };
    }

    /**
     * @param {puppeteer.HTTPRequest} interceptedRequest 
     */
    async handle(interceptedRequest){
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
    getVideoId(){
        const re = new RegExp(/watch\?v=(.*)/);
        let u = this.url.match(re);
        logs.write('cazzo', u[1]);
        return u[1];
    }

    async getAvailableQualityLevels(){
        return await this.settings.page.evaluate(() => {
            return document.querySelector('#movie_player').getAvailableQualityLevels();
        })
    }

    async setPlaybackQualityRange(quality){
        await this.settings.page.evaluate((quality) => {
            document.querySelector('#movie_player').setPlaybackQualityRange(quality);
        }, quality);
    }

    changeQuality() {
        const poll = resolve => {
            if(func()) resolve();
            else setTimeout(_ => poll(resolve), 400);
        }
        return new Promise(poll);
    }
}
module.exports = { Youtube }
const logs = require('../utils/logs.js');
const puppeteer = require('puppeteer');

const urls = require('../utils/urls.js');
const Extractor = require('./extractor.js').Extractor;
const delay = require('../utils/utils.js').delay;

const minDuration = 60;

class Youtube extends Extractor{
    /** construct Youtube extractor
     * @param {string} url 
     * @param {'audio' | 'video'} grab 
     */
    constructor(url, grab){
        super(url, grab);
        this.needs_browser = true;
    }
    /** main extractor method
     * @returns { Result } the result of the extraction 
     */
    async extract(){
        if(this.video.download){
            this.qualities = await this.getAvailableQualityLevels();
            logs.debug("Available qualities", this.qualities);
            await this.setPlaybackQualityRange(this.qualities[this.qualities.length -1]);
        }

        await this.page.waitForResponse((request) => {
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
        this.title = await this.page.title()
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

    /** method called on every intercepted request
     * @param {puppeteer.HTTPRequest} interceptedRequest 
     * @returns { InterceptionResult }
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

    /** get ID of video from url
     * @returns {string} the ID
     */
    getVideoId(){
        const re = new RegExp(/watch\?v=(.*)/);
        let u = this.url.match(re);
        logs.write('cazzo', u[1]);
        return u[1];
    }

    /** get available quality levels for this video by executing getAvailableQualityLevels() on #movie_player element 
     * @returns { Array.<string> } available qualities
     */
    async getAvailableQualityLevels(){
        return await this.page.evaluate(() => {
            return document.querySelector('#movie_player').getAvailableQualityLevels();
        })
    }

    /** set video quality by executing setPlaybackQualityRange() on #movie_player element
     */
    async setPlaybackQualityRange(quality){
        await this.page.evaluate((quality) => {
            document.querySelector('#movie_player').setPlaybackQualityRange(quality);
        }, quality);
    }
}
module.exports = { Youtube }
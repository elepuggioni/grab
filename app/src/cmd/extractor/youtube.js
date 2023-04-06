const logs = require('../utils/logs.js');
const pages = require('../utils/pages.js');
const urls = require('../utils/urls.js');
const io = require('../utils/io.js');
const ffmpeg = require('../utils/ffmpeg.js');
const Extractor = require('./extractor.js').Extractor;
const delay = require('../utils/utils.js').delay;

const minDuration = 150;

class Youtube extends Extractor{
    /** construct Youtube extractor
     * @param {string} url 
     * @param {'audio' | 'video'} grab 
     */
    constructor(url, grab){
        super(url, grab);
        this.needs_browser = true;
        this.ytInitialPlayerResponse = {};
        this.interceptedStreamingRequests = [];
    }
    /** main extractor method
     * 
     * @returns { Result } the result of the extraction 
     */
    // type AdaptiveFormat {
    //     itag: int,
    //     mimeType: String, // "video/mp4; codecs=\"avc1.4d401e\"",
    //     bitrate: int,
    //     width: int,
    //     height: int,
    //     initRange: {
    //         start: int,
    //         end: int
    //     },
    //     indexRange: {
    //         start: int,
    //         end: int
    //     },
    //     lastModified: int,
    //     contentLength: int,
    //     quality: String,
    //     fps: 25,
    //     qualityLabel: String,
    //     projectionType: String,
    //     averageBitrate: int,
    //     approxDurationMs: int,
    //     signatureCipher: String

            // this.streams.push({
        //     type: 'video',
        //     url: this.ytInitialPlayerResponse.streamingData.adaptiveFormats[0].url,
        // });
        // logs.debug(this.ytInitialPlayerResponse.streamingData.adaptiveFormats[0]);
    // };
    async extract(){
        this.page = await pages.newPage(this.browser, true);
        await this.page.goto(this.url, { waitUntil: 'networkidle0' });

        this.ytInitialPlayerResponse = await this.page.evaluate(() => {
                return ytInitialPlayerResponse;
            }
        );

        // sometimes the stream url is immediately available
        if(this.ytInitialPlayerResponse.streamingData.adaptiveFormats[0].url !== undefined){
            // todo: choose quality option
            let command = new ffmpeg.Command(
                this.ytInitialPlayerResponse.streamingData.adaptiveFormats[0].url,
                'prova'
                );
            command.download().exec();
        }
        else{
            // otherwise we have to intercept the network requests
            await this.page.close();
            this.page = await pages.newPage(this.browser, true);

            await this.page.setRequestInterception(true);
            let blockedHosts = io.readBlockedHosts();
            this.page.on('request', async request => {
                // abort requests coming from blacklisted domains
                let requestUrl = new URL(request.url());

                if (blockedHosts[requestUrl.hostname]) {
                    await request.abort();
                }
                else {
                    if(requestUrl.hostname.search('googlevideo.com') !== -1){
                        logs.debug('Intercepted a request...');
                        this.interceptedStreamingRequests.push(requestUrl);
                    }
                    await request.continue();
                }
            });

            await this.page.goto(this.url, { waitUntil: 'networkidle0' });

            this.ytInitialPlayerResponse = await this.page.evaluate(() => {
                    return ytInitialPlayerResponse;
                }
            );

            // get stream urls
            for(let i = 0; i < this.interceptedStreamingRequests.length || !(this.done.audio && this.done.video); i++){
                const url = this.interceptedStreamingRequests[i];
                
                let r = this.handle(url);
                if(r.ok){
                    this.streams.push(r.stream);
                    this.done[r.stream.type] = true;
                    logs.debug('audio', this.done.audio);
                }
            }

            let command = new ffmpeg.Command(
                this.streams[0].url,
                'prova',
                'mp3'
                );
            command.download().exec();
        }
        
        return {
            title: 'cazzo',
            streams: this.streams
        };
    }

    /** method called on every intercepted request
     * @param {URL} url 
     * @returns { InterceptionResult }
     */
    handle(url){
        let result = {
            ok: false
        };

        let params = urls.deconstruct(urls.decode(url.href));

        if(params.dur !== undefined && this.ytInitialPlayerResponse.streamingData.formats[0].approxDurationMs.startsWith(params.dur.split('.')[0])){
            const re = new RegExp(/range=[^&]*/);

            result = {
                ok: true,
                stream: {
                    type: params.mime.substring(0, params.mime.indexOf("/")),
                    url: url.href.replace(re, 'range=0-999999999')
                },
            }
            logs.debug(params);
        }
        return result;
    }

    /** get ID of video from url
     * @returns {string} the ID
     */
    getVideoId(){
        const re = new RegExp(/watch\?v=(.*)/);
        let u = this.url.match(re);
        logs.write('ID', u[1]);
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

    async checkForAds(){
        return await this.page.waitForFunction("document.querySelector('.video-ads.ytp-ad-module') && document.querySelector('.video-ads.ytp-ad-module').clientHeight != 0", {timeout: 4000});
    }

    async waitForSkipAdsButton(){
        return await this.page.waitForFunction("document.querySelector('.ytp-ad-skip-button.ytp-button') && document.querySelector('.ytp-ad-skip-button.ytp-button').clientHeight != 0", {timeout: 10000});
    }

    async skipAds(){
        if(await this.checkForAds()){
            logs.debug('FUCKING ADS');
                if(await this.waitForSkipAdsButton()){
                    return await this.page.$('.ytp-ad-skip-button.ytp-button')
                        .then((skipButton) => skipButton.click())
                        .then(() => logs.debug('Button clicked!'));
                }
        }
        else{
            logs.debug('NO ADSS');
            return Promise.resolve();
        }
        
    }
}
module.exports = { Youtube }
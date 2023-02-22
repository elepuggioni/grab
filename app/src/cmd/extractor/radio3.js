const logs = require('../utils/logs.js');
const puppeteer = require('puppeteer');

const urls = require('../utils/urls.js');
const Extractor = require('./extractor.js').Extractor;
const delay = require('../utils/utils.js').delay;

const minDuration = 60;

class Radio3 extends Extractor{
    /** construct Radio3 extractor
     * @param {string} url 
     */
    constructor(url){
        super(url, 'audio');
    }
    /** main extractor method
     * @returns { Result } the result of the extraction 
     */
    async extract(){
        await this.page.waitForResponse((request) => {
                this.handle(request, this.settings)
                .then((r) => {
                    if(r.ok){
                        this.streams.push(r.stream);
                        this.done[r.stream.type] = true;
                    }
                });
                return this.done.audio;
            })
            .catch(r => logs.error(r));

        // get title and author
        this.title = await this.page.title()
        .then(t => t.trimEnd());

        delay(300);

        // for now take the first audio and video it finds and set it as the stuff to download
        for (let stream of this.streams) {
            if (stream.type === 'audio' && this.downloads.audio === undefined) {
                this.downloads.audio = stream.url;
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
        let url = new URL(interceptedRequest.url());
        
        let result = {
            ok: false
        };

        // filter requests to find the ones containing the chunklist ().m3u8 file)
        if (url.href.endsWith('m3u8')){
            result = {
                ok: true,
                stream: {
                    type: 'audio',
                    url: url.href
                },
            }
            logs.debug(result);
        }
        return result;
    }
}
module.exports = { Radio3 }
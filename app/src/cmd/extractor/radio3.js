const logs = require('../utils/logs.js');
const puppeteer = require('puppeteer');
const fetch = require('cross-fetch');

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
        this.needs_browser = false;
    }
    
    /** main extractor method
     * @returns { Result } the result of the extraction 
     */
    async extract(){
        let split_url = this.url.href.split('.');
        split_url[split_url.length -1] = 'json';

        let info_url = split_url.join('.');

        let result = await fetch(info_url)
                .then(r => r.json())
                .then(r => r)
                .catch(r => logs.error('Error fetching info json', r));

                logs.debug(info_url)
                logs.debug(result);

        return {
            title: result.audio.title.replaceAll('/', '-'),
            type: result.audio.type,
            duration: result.audio.duration,
            poster: 'https://www.raiplaysound.it' + result.audio.poster.replaceAll('%20', ' '),
            download: {
                audio: result.audio.url,
            }
        };
    }
}
module.exports = { Radio3 }
const config = require('../config/config.js');
const logs = require('../utils/logs.js');

class Extractor{
    /** create config object
    * @param {URL} url
    * @param {string} grab
    */
    constructor(url, grab){
        if(!['audio', 'video'].includes(grab)){
            logs.error();
            grab = 'audio';
        }

        this.url = url;
        this.grab = grab;
        this.domain = this.url.hostname.split('.')[1];
        this.audio = {
            name: 'audio',
            download: true,
            quality: config.Quality.highest,
            format: config.AudioFormat.any,
        };
        this.video = {
            name: 'video',
            download: grab === 'video',
            quality: config.Quality.highest,
            format: config.VideoFormat.any,
        };

        this.streams = [];
        this.downloads = {};
        this.done = {
            audio: false,
            video: !this.video.download,
        };

        this.title = "";
        this.author = "";
    }

    /** set audio options
    * @param {config.Quality} quality
    * @param {config.AudioFormat} format
    */
    config_audio(quality, format){
        if(this.audio.download){
            this.audio.quality = quality;
            this.audio.format = format;
        }
    }

    /** set video options
    * @param {config.Quality} quality
    * @param {config.VideoQualityLabel} qualityLabel
    * @param {config.VideoFormat} format
    */
    config_video(quality, qualityLabel, format){
        if(this.video.download){
            this.video.quality = quality;
            this.video.qualityLabel = qualityLabel;
            this.video.format = format;
        }
    }

    /** set page
    * @param {puppeteer.Page} quality
    */
    set_page(page){
        this.page = page;
    }
}

module.exports = { Extractor };
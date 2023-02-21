const def = require('../config/def.js');
const logs = require('../utils/logs.js');
const youtube = require('./youtube.js');

class Extractor{
    /** create config object
    * @param {string} url
    * @param {string} grab
    */
    constructor(url, grab){
        if(!['audio', 'video'].includes(grab)){
            logs.error();
            grab = 'audio';
        }

        this.url = new URL(url);
        this.grab = grab;
        this.domain = this.url.hostname.split('.')[1];
        this.audio = {
            name: 'audio',
            download: true,
            quality: def.Quality.highest,
            format: def.AudioFormat.any,
        };

        this.video = {
            name: 'video',
            download: grab === 'video',
            quality: def.Quality.highest,
            format: def.VideoFormat.any,
        };

        this.streams = [];
        this.downloads = {};

        this.title = "";
        this.author = "";

        this.handler = this.set_handler();
    }

    static setup(){
        logs.write('Setting up...');
        // process.argv.slice(2, 3)[0] to get cli arguments

        let url = process.argv.slice(2, 3)[0];
        if(url === undefined){
            logs.fatal("Missing URL parameter.");
        }

        // todo check url is valid 

        let settings = new Config(
            url,
            process.argv.slice(3, 4)[0],
        );

        logs.debug(settings);

        return settings;
    }

    set_handler(){
        switch(domain){
            case 'youtube':
                handler = youtube.handle;
                break;
            default:
                logs.fatal('Unknown domain.')
        }
    }

    /** set audio options
    * @param {def.Quality} quality
    * @param {def.AudioFormat} format
    */
    config_audio(quality, format){
        if(this.audio.download){
            this.audio.quality = quality;
            this.audio.format = format;
        }
    }

    /** set video options
    * @param {def.Quality} quality
    * @param {def.VideoQualityLabel} qualityLabel
    * @param {def.VideoFormat} format
    */
    config_video(quality, qualityLabel, format){
        if(this.video.download){
            this.video.quality = quality;
            this.video.qualityLabel = qualityLabel;
            this.video.format = format;
        }
    }

    set_page(page){
        this.page = page;
    }
}

module.exports = { Extractor };
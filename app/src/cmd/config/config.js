const def = require('./def.js');
const log = require('../utils/log.js');
const youtube = require('../extractor/youtube.js');

class Config{
    /** create config object
    * @param {string} url
    * @param {string} grab
    */
    constructor(url, grab){
        if(!['audio', 'video'].includes(grab)){
            log.error();
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
    }

    static setup(){
        log.write('Setting up...');

        let url = process.argv.slice(2, 3)[0];
        if(url === undefined){
            log.fatal("Missing URL parameter.");
        }

        // todo check url is valid 

        let settings = new Config(
            url,
            process.argv.slice(3, 4)[0],
        );

        settings.set_handler();

        log.debug(settings);

        return settings;
    }

    set_handler(){
        switch(this.domain){
            case 'youtube':
                this.handler = youtube.handle;
                break;
            default:
                log.fatal('Unknown domain.')
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
}

module.exports = { Config };
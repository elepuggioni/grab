const cp = require('node:child_process');
const logs = require('./logs.js');
const def = require('../config/def.js');

const ffmpeg = 'ffmpeg';
const ffprobe = 'ffprobe';

class Command{

    /**
     * Construct a new ffmpeg / ffprobe command
     * @param {String} url stream to probe/download
     * @param {String} filename (optional) name of the file that will be downloaded. Default name is 'output'
     * @param {String} container (optional) file extension for the container, without leading dot; e.g. mp3, mp4, flac ... Default extension is mp3
     */
    constructor(url, filename, container){
        if(url === undefined){
            logs.fatal("Missing URL in call to ffmpegCommand constructor");
        }
        this.url = url;
        this.directory = '/grab/downloads/' // todo: change to be dynamic
        this.filename = filename || 'output';
        this.container = '.' + container || '.mp3';
        this.args = [
            "-hide_banner",
            "-i",
            "\"" + url + "\"",
        ];
        this.command = '';
    }

    get ffmpeg() {
        return ffmpeg;
    }

    get ffprobe() {
        return ffprobe;
    }

    download(){
        this.command = this.ffmpeg;
        return this;
    }

    probe(){
        this.command = this.ffprobe;
        return this;
    }

    exec(){
        this.command += " " + this.args.join(" ");
        this.command += " " + this.directory + this.filename.concat(this.container);

        logs.write('Executing command', '\n', this.command);
        
        cp.spawn(this.command, {
            stdio: 'inherit',
            shell: true,
        });
    };

    audioOnly(){

    }

    audioFormat(){

    }
    
}
function probe(url){
    cp.exec("ffprobe -hide_banner -print_format json -show_format -show_streams  " + "\"" + url + "\"", (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });

}

/**
 * 
 * @param {string} url
 */
function download(url, filename){
    let command = "ffmpeg -hide_banner -i " + "\"" + url + "\"" + " -vn -c copy " + filename;

    cp.spawn(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
}

module.exports = { Command }
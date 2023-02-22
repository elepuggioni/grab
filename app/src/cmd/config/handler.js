const Youtube = require('../extractor/youtube.js').Youtube;
const logs = require('../utils/logs.js');

function get_handler(url, grab){
    let handler;
    switch(url.hostname.split('.')[1]){
        case 'youtube':
            handler = new Youtube(url, grab);
            break;
        default:
            logs.fatal('Unknown domain.')
    }
    return handler;
}

module.exports = { get_handler };
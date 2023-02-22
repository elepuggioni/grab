const Youtube = require('../extractor/youtube.js').Youtube;
const logs = require('../utils/logs.js');

/** get correct extractor based on url domain
 * @returns { <E extends Extractor> } a class that extends Extractor
*/
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
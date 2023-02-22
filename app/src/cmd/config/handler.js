const Youtube = require('../extractor/youtube.js').Youtube;
const Radio3 = require('../extractor/radio3.js').Radio3;

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
        case 'raiplaysound':
            handler = new Radio3(url);
            break;
        default:
            logs.fatal('Unknown domain.')
    }
    return handler;
}

module.exports = { get_handler };
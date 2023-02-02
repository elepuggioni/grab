const DEBUG = true;

/** print message to console if debug mode
 * @param { string } message
*/
function debug(message){
    if(DEBUG){
        console.log(message);
    }
}

/** print message to console
 * @param { string } message
*/
function write(message){
    console.log(message);
}

module.exports = { write, debug };
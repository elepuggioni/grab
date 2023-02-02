const DEBUG = true;

/** print message to console if debug mode
 * @param { any } message
*/
function debug(message){
    if(DEBUG){
        console.log(message);
    }
}

/** print message to console
 * @param { any } message
*/
function write(message){
    console.log(message);
}

/** print message to console, then exit
 * @param { any } message
 * @param { number } exit_code optional, default is 1
*/
function fatal(message, exit_code){
    exit_code ??= 1;

    console.log(message);
    process.exit(code);
}

module.exports = { write, debug, fatal };
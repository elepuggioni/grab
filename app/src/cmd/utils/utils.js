function isCurrentUserRoot() {
    return process.getuid() == 0; // UID 0 is always root
}

/** waits until func returns true */
function waitFor(func) {
    const poll = resolve => {
        if(func()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }
    return new Promise(poll);
}

/** pause execution for a certain time
 * @param { number } ms time in milliseconds
*/
function delay(ms) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, ms)
    });
}

module.exports = { delay };
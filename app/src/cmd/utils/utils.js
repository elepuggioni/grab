function isCurrentUserRoot() {
    return process.getuid() == 0; // UID 0 is always root
}

// waits until func returns true
function waitFor(func) {
    const poll = resolve => {
        if(func()) resolve();
        else setTimeout(_ => poll(resolve), 400);
    }
    return new Promise(poll);
}

export function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}
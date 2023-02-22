const fs = require('fs');

/** convert data to json and write it to file 
 * @param { string } file a path to a file
 * @param { any } data an object to write to file
 * @returns { Error | null }
*/
function write(file, data) {
    fs.writeFile(file, JSON.stringify(data, null, "\t"), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return err;
        }
        else{
            return null;
        }
    });
}

/** calls fs.readFileSync(file, 'utf8') to read all contents of file 
 * @param { string } file a path to a file
 * @returns { string } with the contents of the file
*/
function read(file) {
    return fs.readFileSync(file, 'utf8');
}

/** reads the hosts.txt file where the blocked domains are stored
 * @returns { Object.<string, boolean> } an associative array where key: domain_name and value: true
*/
function readBlockedHosts(){
    let file = read('./app/src/config/hosts.txt').split('\n');
    let hosts = {};

    for (let line of file){
        let host = {
            ip: line.split(' ')[0],
            domain: line.split(' ')[1]
        };

        if (host.domain !== undefined && host.ip === '0.0.0.0') {
            hosts[host.domain.trim()] = true;
        }
    }
    return hosts;
}

function writePlaylist(data){
    return write('app/src/playlist.json', data);
}

module.exports = { write, read, readBlockedHosts, writePlaylist };
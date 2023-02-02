const io = require('./io.js');

/** reads the hosts.txt file where the blocked domains are stored
 * @returns { Object.<string, boolean> } an associative array where key: domain_name and value: true
*/
function readBlockedHosts(){
    let file = io.read('./app/src/config/hosts.txt').split('\n');
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

module.exports = { readBlockedHosts };
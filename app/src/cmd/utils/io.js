const fs = require('fs');

/** convert data to json and write it to file 
 * @param { string } file a path to a file
 * @param { any } data an object to write to file
 * @returns { Error | null }
*/
function write(file, data) {
    fs.writeFile(file, JSON.stringify(data), 'utf8', (err) => {
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

module.exports = { write, read };
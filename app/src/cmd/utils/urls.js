/**
 * 
 * @param {string} url 
 * @returns {string}
 */
function decode(url){
    return url.replaceAll('%2F', '/')
              .replaceAll('%252F', '/')
              .replaceAll('%2C', '\,')
              .replaceAll('%252C', '\,')
              .replaceAll('%3D', '=')
              .replaceAll('%253D', '=')
              .replaceAll('%26', '&')
              .replaceAll('%3F', '?');
}

/**
 * 
 * @param {string} url 
 * @returns { Object.<string, boolean> } an associative array where key: param_name and value: param_value
 */
function deconstruct(url){
    let params = {};

    // parse url for params
    for(const param of url.split('&')){
        let s = param.split('=');
        let key = s[0];
        let value = s[1];

        if (Object.keys(params).length === 0){
            key = key.substring(key.indexOf("?") + 1);
        }
        params[key] = value;
    }
    return params;
}

module.exports = { decode, deconstruct };

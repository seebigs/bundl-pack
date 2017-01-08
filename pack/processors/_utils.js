
function escapeSingleQuotes (str) {
    return str.replace(new RegExp('\'', 'g'), "\\'");
}

module.exports = {
    escapeSingleQuotes: escapeSingleQuotes
};

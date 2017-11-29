
function escapeBackslashes (str) {
    return str.replace(/\\/g, '\\\\');
}

function escapeSingleQuotes (str) {
    return str.replace(new RegExp('\'', 'g'), "\\'");
}

module.exports = {
    escapeBackslashes: escapeBackslashes,
    escapeSingleQuotes: escapeSingleQuotes
};

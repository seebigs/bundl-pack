
function extractEntryModule (found, entryFile) {
    var entryMod = found.modules[entryFile.path];
    entryMod.id = 0;
    delete found.modules[entryFile.path];
    return entryMod;
}

module.exports = extractEntryModule;

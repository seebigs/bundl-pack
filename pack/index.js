/**
 * Crawl a target JS file for dependencies and package them for runtime usage
 */

var detective = require('detective');
var fs = require('fs');
var getProcessor = require('./processors/_get.js');
var Module = require('module');
var path = require('path');
var prelude = require('./prelude.js');
var resolve = require('./resolve.js');
var utils = require('seebigs-utils');

// template
Module._extensions['.template'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var template = require('lodash.template')(require('./pack.template'));

var args = utils.args();

function mockDetective (contents) {
    var matchMock = /require\.cache\.mock\(['"]([\w\.\/-]+)/g;
    matchMock = matchMock.exec(contents);
    return matchMock ? matchMock[1] : [];
}

function crawlDependencies (options, file, pack, requireAs, isEntry) {
    var filepath = isEntry ? file.path : path.resolve(file.path);
    var contents = file.contents.toString();
    var ext = path.extname(filepath).substr(1);
    var filename = filepath.split('/').pop();
    var relMap = {};

    // run processors
    var fileObj = {
        contents: contents,
        ext: ext,
        path: filepath,
        filename: filename
    };

    var procOptions = (isEntry ? (options.entry || options.js) : options[ext]) || {};
    var p = {};

    try {
        if (typeof procOptions === 'function') {
            p = procOptions(getProcessor, options);
            procOptions = {};
        } else if (!isEntry && ext !== 'js') {
            p = getProcessor(ext);
        }

        if (typeof p.processor === 'function') {
            contents = p.processor(fileObj, procOptions) + '\n';
        }

        if (p.requireAs && procOptions.autoInject !== false) {
            requireAs[ext] = p.requireAs;
        }

    } catch (err) {
        console.log('Error in ' + ext + ' preprocessor');
        console.log(err.stack);
        process.exit(1);
    }

    pack[filepath] = {
        id: Object.keys(pack).length,
        path: filepath,
        contents: contents
    };

    // find require statements in this file
    var reqs = [].concat(detective(contents), mockDetective(contents));

    reqs = reqs.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    utils.each(reqs, function (req) {
        var mod = resolve(req, filepath, options.paths);

        if (mod.contents) {
            if (!pack[mod.path]) {
                if (args.verbose) {
                    console.log('- Required ' + mod.path);
                }

                var subfile = {
                    base: path.dirname(mod.path),
                    contents: mod.contents,
                    id: req,
                    path: mod.path
                };

                Object.assign(pack, crawlDependencies(options, subfile, pack, requireAs));
            }

            relMap[req] = mod.path;

        } else {
            console.log();
            console.log('Module "' + req + '" not found from ' + (filepath || file.srcArray));
        }

    });

    pack[filepath].relMap = relMap;

    return pack;
}

function wrapModule (mod, pack, options) {
    var leadingComment = '/*** [' + (mod.id) + '] ' + mod.path + ' ***/\n\n';
    var modOpener = '/***/[function (require, module, exports) {\n';
    var modCloser = '\n\n\n/***/}, ';

    var map = {};
    utils.each(mod.relMap, function (abs, rel) {
        var m = pack[abs];
        var coord = m ? m.id : 0;
        if (options.obscure) {
            var matchReq = new RegExp('require\\([\\\'\\"]' + rel + '[\\\'\\"]\\)', 'g');
            mod.contents = mod.contents.replace(matchReq, 'require(' + coord + ')');
            map[coord] = coord;
        } else {
            map[rel] = coord;
        }
    });

    var modStr = modOpener + leadingComment + mod.contents + modCloser;
    modStr += JSON.stringify(map);
    return modStr + '],\n';
}

// bundle any requireAs functions
function writeRequireAs (requireAs) {
    if (Object.keys(requireAs).length) {
        var asStr = ', {';

        utils.each(requireAs, function (fn, ext) {
            asStr += '\n' + ext + ': ' + fn.toString() + ',';
        });

        return asStr.slice(0, -1) + '\n}';
    }

    return '';
}


/**
 * Pack your dependencies
 * @param {Object} resource { name, contents, src }
 * @option {Object} options
 * @return { contents, changemap }
 */

function create (resource, options) {
    resource.src = resource.src || [];
    options = options || {};

    var modulesStr = '';
    var concatenatedEntryName = '#entry';
    var entryFile = {
        contents: resource.contents
    };

    if (resource.src.length === 1 && typeof resource.src[0] === 'string') {
        entryFile.path = resource.src[0];
        entryFile.base = path.dirname(entryFile.path);

    } else {
        entryFile.path = concatenatedEntryName;
        entryFile.srcArray = resource.src; // array of src inputs
    }

    // track which requireAs should be included
    var requireAs = {};

    // walk the tree and build `pack`
    var pack = crawlDependencies(options, entryFile, {}, requireAs, true);

    // add pack to changemap
    var changemap = {};
    utils.each(pack, function (mod, modPath) {
        changemap[modPath] = resource.name;
    });

    // add entry module
    var entryMod = pack[entryFile.path];
    entryMod.id = 0;
    modulesStr += wrapModule(entryMod, pack, options);
    delete pack[entryFile.path];

    // add modules
    utils.each(pack, function (mod) {
        modulesStr += wrapModule(mod, pack, options);
    });

    // wrap modules before/after
    modulesStr = template({
        prelude: prelude.toString(),
        modules: modulesStr, // modulesStr.slice(0, -3),
        requireAs: writeRequireAs(requireAs)
    });

    return {
        changemap: changemap,
        contents: modulesStr
    };
}


module.exports = create;

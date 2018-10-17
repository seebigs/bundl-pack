var bundlPack = require('../../index.js');

describe('can be used standalone', function (expect) {
    var contents = 'require("./test/fixtures/commonjs/sub/two.js");';
    bundlPack.create(contents, {}, function (packed) {
        expect(packed.indexOf('proc.css ***/')).not.toBe(-1);
    });
});

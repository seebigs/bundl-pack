var bundlPack = require('../../index.js');

describe('can be used standalone', function (expect) {
    var contents = 'require("./test/fixtures/commonjs/sub/two.js");';
    var packed = bundlPack.create(contents);
    expect(packed.indexOf('/*** [0] #entry ***/')).not.toBe(-1)
});

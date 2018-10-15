const nodeAsBrowser = require('node-as-browser');
nodeAsBrowser.init(global);

const FeatherTest = require('feather-test');

const myTest = new FeatherTest({
    specs: [
        './specs/basic.spec.js',
        './specs/es6.spec.js',
        './specs/cached.spec.js',
        './specs/mocked.spec.js',
        './specs/requireAs.spec.js',
        './specs/standalone.spec.js',
    ],
});

myTest.run();

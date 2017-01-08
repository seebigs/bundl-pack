# bundl-pack

*Pack project dependencies into one JS file. Easily include external HTML and CSS files as strings. Pre-process LESS, SASS, CoffeeScript, and more...*

*Note: Only works with CommonJS `require` for now, but ES6 `import` is coming soon!*

```
$ npm install --save-dev bundl-pack
```

```js
var bundl = require('bundl');
var pack = require('bundl-pack');
var write = require('bundl-write');

var packOptions = {
    paths: ['/src/javascripts']
};

bundl('entry.js')
    .then(pack(packOptions))
    .then(write())
    .all();
```

# Options

## .paths
An array of paths to use when resolving required/imported files
```js
{
    paths: [
        'src/javascripts',
        'src/stylesheets'
    ]
}
```

## .[extension]
Define processors and options for files of any type
```js
var lessProcessor = require('bundl-processor-less');

{
    css: {
        compatibility: 'ie8',
        autoInject: false
    },
    html: {
        removeComments: false
    },
    json: {
        autoInject: false
    },
    less: lessProcessor({
        relativeUrls: false
    })
}
```

# Stand-Alone Usage

If you want to package files manually, you can do the following:

```js
var pack = require('bundl-pack');

var packed = pack(options).one(entryFileContents);

console.log(packed.contents);
```

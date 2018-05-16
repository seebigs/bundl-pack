# bundl-pack

*Pack project dependencies into one JS file. Easily include external HTML and CSS files as strings. Pre-process LESS, SASS, CoffeeScript, and more...*

*Supports ES6 imports via [bundl-pack-babel](https://github.com/seebigs/bundl-pack-babel)*

Default processors automatically handle the requiring/importing of the following extensions. (Default behavior can be modified or overriden, and [plugins already exist](https://github.com/seebigs/bundl/wiki/Popular-Plugins#modules--dependencies) to allow easy importing of many other popular file types)
* json
* css
* html

---

# Use as a plugin

```
$ npm install --save-dev bundl-pack
```

```js
var Bundl = require('bundl');
var pack = require('bundl-pack');
var write = require('bundl-write');

var packOptions = {
    paths: ['/src/javascripts'],
};

new Bundl('entry.js')
    .then(pack(packOptions))
    .then(write())
    .go();
```

# Use standalone

If you want to just pass a String of contents and return the packaged result, you can do the following:

```js
var pack = require('bundl-pack');
var fileContents = '...';
var packed = pack.create(fileContents, options);
console.log(packed);
```

---

# Options

## .paths
An array of paths to use when resolving required/imported files
```js
{
    paths: [
        'src/javascripts',
        'src/stylesheets',
    ]
}
```

## .leadingComments
Display a comment at the top of every module showing the full module path. Defaults to true.
```js
{
    leadingComments: false,
}
```

## .obscure
Hide relative path names from require statements (`require('../path/file.js')` becomes `require(2)`)
```js
{
    obscure: true,
}
```

## .[extension]
Define processors and options for files of any type. See [plugins](https://github.com/seebigs/bundl/wiki/Popular-Plugins#modules--dependencies)
```js
var babelProcessor = require('bundl-pack-babel');
var lessProcessor = require('bundl-pack-less');

{
    css: {
        compatibility: 'ie8',
        autoInject: false,
    },
    html: {
        removeComments: false,
    },
    json: {
        autoInject: false,
    },
    less: lessProcessor({
        relativeUrls: false,
    }),
    js: babelProcessor({
        presets: ['es2015'],
    }),
}
```

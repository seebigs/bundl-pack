# bundl-pack

*Pack project dependencies into one JS file. Easily include external HTML and CSS files as strings. Pre-process LESS, SASS, CoffeeScript, and more...*

*Supports ES6 imports via [bundl-pack-babel](https://github.com/seebigs/bundl-pack-babel)*

Default processors automatically handle the requiring/importing of the following extensions. (Default behavior can be modified or overriden, and [plugins already exist](https://github.com/seebigs/bundl/wiki/Popular-Plugins#modules--dependencies) to allow easy importing of many other popular file types)
* json
* css
* html

---

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

## .obscure
Hide relative path names from require statements (`require('../path/file.js')` becomes `require(2)`)
```js
{
    obscure: true
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
    }),
    js: babelProcessor({
        presets: ['es2015']
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

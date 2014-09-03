# grunt-var-exporter

> Load a bunch of JS file into node, and export a selected set of variables into a js file.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-var-exporter --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-var-exporter');
```

## The "varExporter" task

### Overview
In your project's Gruntfile, add a section named `varExporter` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  varExporter: {
    options: {
      // Task-specific options go here.
    },
  },
});
```

### Options

#### options.files
Type: `String[]`
Default value: `undefined`

The list of files, relative to the location of the Gruntfile, which will be loaded into a node sandbox.

#### options.export
Type: `String[]`
Default value: `undefined`

The list of vars that you want to see in the destination file. For each string "blah" in the list,
a `var blah = value-of-blah` will be emitted into the `options.dest` file. JSON-encodable values and
regular expressions are allowed, things like functions and Date objects will not work.

#### options.dest
Type: `String`
Default value: `undefined`

The name of the destination file.

#### options.pretty
Type: `boolean`
Default value: `false`

Format JSON, or output everything in one line per export var?

### Usage Examples


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

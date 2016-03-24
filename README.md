# grunt-var-exporter

> Evaluate one or more scripts, and export a selected subset of variables into a file.


## Getting Started
This plugin requires Grunt `^0.4.5`

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
      export: ["appConfig","analyticsConfig"],
      pretty: true,
    },
    files: [{
        src: ["shared_config.js", "dev_config.js"],
        dest: "dist/config.js",
    }]
  },
});
```


### Configuration

#### files[n].src
Type: `String[]`
Required

The list of files, relative to the location of the Gruntfile, which will be loaded into a node sandbox.

#### files[n].dest
Type: `String`
Required

The name of the destination file.

#### options.export
Type: `String[]`
Required

The list of vars that you want to see in the destination file. For each string
"blah" in `files[n].src`, a `var blah = value_of_blah` will be emitted into the
file named by `files[n].dest`. JSON-encodable values and regular expressions
are allowed, while things like functions and Date objects will not work.

#### options.pretty
Type: `boolean`
Default value: `false`

Format JSON, or output everything in one line per export var?


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


## Release History

#### 0.2.0
The varExporter task is now a grunt multi-task. This changes the way you
configure source files and destination files. See
[Configuration](#configuration) for details.

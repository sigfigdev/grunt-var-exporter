var _ = require("lodash");

var grunt = "we don't use this variable, but only need it for typechecking when we import gruntjs = grunt";

var gruntjs = grunt;

var anchann;
(function (anchann) {
    (function (grunt) {
        (function (varExporter) {
            var VarExporter = (function () {
                function VarExporter(grunt) {
                    this.grunt = grunt;
                }
                VarExporter.prototype.registerTask = function () {
                    var theThis = this;

                    this.grunt.registerTask("varExporter", "Run a bunch of files in a node sandbox, and export a subset of the local vars into a .js file.", function () {
                        var task = this;
                        theThis.run.call(theThis, task);
                    });
                };

                VarExporter.prototype.run = function (task) {
                    var DEFAULT_OPTIONS = {
                        pretty: false
                    };

                    var options = task.options(DEFAULT_OPTIONS);
                    var done = task.async();

                    var optionsVerficationError = VarExporter.areOptionsValid(options);
                    if (optionsVerficationError !== undefined) {
                        this.grunt.log.error("Error in task configuration: " + optionsVerficationError);
                        done(false);
                        return;
                    }

                    try  {
                        var filesContent = this.readFiles(options.files);
                        var exportLine = this.generateExportLine(options.export);
                        var tempFilename = this.writeTempFile(filesContent + "\n" + exportLine);
                        var exports = require(require("path").resolve("./" + tempFilename));
                        var destContent = this.generateDestContent(options.export, exports, options.pretty);
                        this.writeDestFile(options.dest, destContent);
                        this.deleteTempFile(tempFilename);

                        done(true);
                    } catch (reason) {
                        this.grunt.log.error(reason);
                        done(false);
                    }
                };

                VarExporter.areOptionsValid = function (options) {
                    if (!options.files || !options.files.length)
                        return "options.files seems misconfigured, should be a non-empty array of strings.";
                    if (!options.dest || typeof options.dest !== "string")
                        return "options.dest seems misconfigured, should be a non-empty string.";
                    if (!options.export || !options.export.length)
                        return "options.export seems misconfigured, should be a non-empty array of strings.";
                    return undefined;
                };

                VarExporter.prototype.readFiles = function (filenames) {
                    var _this = this;
                    return _.reduce(filenames, function (memo, filename) {
                        return memo + ";\n" + _this.grunt.file.read(filename);
                    }, "");
                };

                VarExporter.prototype.generateExportLine = function (vars) {
                    var lines = _.reduce(vars, function (memo, currVar) {
                        memo.push(currVar + ": " + currVar);
                        return memo;
                    }, []);

                    return "module.exports = {\n" + lines.join(",\n") + "};";
                };

                VarExporter.prototype.writeTempFile = function (content) {
                    var tempFilename = "gruntVarExporterTempFile" + Math.floor(100000 * Math.random()) + ".js";
                    this.grunt.file.write(tempFilename, content);
                    return tempFilename;
                };

                VarExporter.prototype.generateDestContent = function (vars, exports, pretty) {
                    if (typeof pretty === "undefined") { pretty = false; }
                    return _.reduce(vars, function (memo, currVar) {
                        return memo + "var " + currVar + " = " + VarExporter.encode(exports[currVar], pretty) + ";\n";
                    }, "");
                };

                VarExporter.prototype.writeDestFile = function (filename, content) {
                    this.grunt.file.write(filename, content);
                };

                VarExporter.prototype.deleteTempFile = function (filename) {
                    this.grunt.file.delete(filename);
                };

                VarExporter.encode = function (value, pretty) {
                    var regexes = {};
                    var regexCount = 0;

                    var replacer = function (key, value) {
                        if (value && value.constructor && value.constructor.toString().substring(0, 15) === "function RegExp") {
                            regexCount++;
                            var regexKey = "____REGEX-PLACEHOLDER-" + regexCount;
                            regexes[regexKey] = value;
                            return regexKey;
                        }

                        return value;
                    };

                    var intermediate = JSON.stringify(value, replacer, pretty ? "\t" : undefined);

                    return _.reduce(regexes, function (memo, regex, key) {
                        return memo.replace("\"" + key + "\"", regex.toString());
                    }, intermediate);
                };
                return VarExporter;
            })();
            varExporter.VarExporter = VarExporter;
        })(grunt.varExporter || (grunt.varExporter = {}));
        var varExporter = grunt.varExporter;
    })(anchann.grunt || (anchann.grunt = {}));
    var grunt = anchann.grunt;
})(anchann || (anchann = {}));

module.exports = function(grunt) {
	var varExporter = new anchann.grunt.varExporter.VarExporter(grunt);
	varExporter.registerTask();
}

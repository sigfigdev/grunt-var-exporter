var _ = require("lodash");

var grunt = "we don't use this variable, but only need it for typechecking when we import gruntjs = grunt";

var gruntjs = grunt;
var anchann;
(function (anchann) {
    var grunt;
    (function (grunt_1) {
        var varExporter;
        (function (varExporter_1) {
            var VarExporter = (function () {
                function VarExporter(grunt) {
                    this.grunt = grunt;
                }
                VarExporter.prototype.registerTask = function () {
                    var varExporter = this;
                    this.grunt.registerMultiTask("varExporter", "Run a bunch of files in a node sandbox, and export a subset of the local vars into a .js file.", function () {
                        var task = this;
                        varExporter.run.call(varExporter, task);
                    });
                };
                VarExporter.prototype.run = function (task) {
                    var _this = this;
                    var DEFAULT_OPTIONS = {
                        pretty: false,
                    };
                    var options = task.options(DEFAULT_OPTIONS);
                    var done = task.async();
                    var taskConfigErrors = VarExporter.taskConfigErrors(task, options);
                    if (taskConfigErrors) {
                        this.grunt.log.error("Error in task configuration: " + taskConfigErrors);
                        return done(false);
                    }
                    task.files.forEach(function (files) {
                        try {
                            var filesContent = _this.readFiles(files.src);
                            var exportLine = _this.generateExportLine(options.export);
                            var tempFilename = _this.writeTempFile(filesContent + "\n" + exportLine);
                            var exports = require(require("path").resolve("./" + tempFilename));
                            var destContent = _this.generateDestContent(options.export, exports, options.pretty);
                            _this.grunt.log.ok("Writing " + destContent.length + " bytes to " + files.dest);
                            _this.writeDestFile(files.dest, destContent);
                            _this.deleteTempFile(tempFilename);
                        }
                        catch (reason) {
                            _this.grunt.log.error("Error processing config from " + files.src + ":\n " + reason);
                            done(false);
                        }
                    });
                    done(true);
                };
                VarExporter.taskConfigErrors = function (task, options) {
                    var errors = [];
                    if (!task.files || !task.files.length) {
                        errors.push('it should have some files.');
                    }
                    if (!options.export || !options.export.length) {
                        errors.push('it should have some exports');
                    }
                    task.files.forEach(function (files) {
                        if (!files.src || !files.src.length) {
                            errors.push('it should specify at least one file in "src"');
                        }
                        if (!files.dest || typeof files.dest !== "string") {
                            errors.push('it should specify a file in "dest"');
                        }
                    });
                    if (errors.length) {
                        var indent = '\n    ';
                        return (task.nameArgs + " seems misconfigured:") + indent + errors.join(indent);
                    }
                };
                VarExporter.prototype.readFiles = function (filenames) {
                    var _this = this;
                    return _.reduce(filenames, function (memo, filename) { return memo + ";\n" + _this.grunt.file.read(filename); }, "");
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
                    if (pretty === void 0) { pretty = false; }
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
            }());
            varExporter_1.VarExporter = VarExporter;
        })(varExporter = grunt_1.varExporter || (grunt_1.varExporter = {}));
    })(grunt = anchann.grunt || (anchann.grunt = {}));
})(anchann || (anchann = {}));
//# sourceMappingURL=tslib.js.map
module.exports = function(grunt) {
	var varExporter = new anchann.grunt.varExporter.VarExporter(grunt);
	varExporter.registerTask();
};

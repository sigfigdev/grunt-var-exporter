///<reference path='../bower_components/DefinitelyTyped/gruntjs/gruntjs.d.ts'/>
///<reference path='../bower_components/DefinitelyTyped/lodash/lodash.d.ts'/>

import gruntjs = grunt;

/*
 * grunt-var-exporter
 * https://github.com/sigfigdev/grunt-var-exporter
 *
 * Copyright (c) 2014 anchann
 * Copyright (c) 2016 Nvest Inc
 * Licensed under the MIT license.
 */
module anchann.grunt.varExporter {

	type Task = gruntjs.task.IMultiTask<{}>;

	interface Options {
		export: string[];
		pretty: boolean;
	}

	interface Exports {
		[key: string]: any;
	}

	export class VarExporter {
		constructor(private grunt: IGrunt) { }

		public registerTask(): void {
			var varExporter = this;

			this.grunt.registerMultiTask(
				"varExporter",
				"Run a bunch of files in a node sandbox, and export a subset of the local vars into a .js file.",
				// we explicitly don't want this binding, so using non-ts function literal syntax
				function() {
					var task: Task = this;
					varExporter.run.call(varExporter, task);
				}
			);
		}

		public run(task: Task): void {
			var DEFAULT_OPTIONS: Options = <any>{
				pretty: false,
			};

			var options = task.options<Options>(DEFAULT_OPTIONS);
			var done: gruntjs.task.AsyncResultCatcher = task.async();

			var taskConfigErrors = VarExporter.taskConfigErrors(task, options);
			if (taskConfigErrors) {
				this.grunt.log.error("Error in task configuration: " + taskConfigErrors);
				return done(false);
			}

			task.files.forEach((files): void => {
				try {

					var filesContent: string = this.readFiles(files.src);
					var exportLine: string   = this.generateExportLine(options.export);
					var tempFilename: string = this.writeTempFile(filesContent + "\n" + exportLine);
					var exports: Exports     = require(require("path").resolve("./" + tempFilename));
					var destContent: string  = this.generateDestContent(options.export, exports, options.pretty);
					this.grunt.log.ok(`Writing ${destContent.length} bytes to ${files.dest}`);
					this.writeDestFile(files.dest, destContent);
					this.deleteTempFile(tempFilename);

				} catch (reason) {
					this.grunt.log.error(`Error processing config from ${files.src}:\n ${reason}`);
					done(false);
				}

			});
			done(true);
		}

		private static taskConfigErrors(task: Task, options: Options): string /* or undefined */ {
			var errors = [];
			if (!task.files || !task.files.length) { errors.push('it should have some files.'); }
			if (!options.export || !options.export.length) { errors.push('it should have some exports'); }
			task.files.forEach((files): void => {
				if (!files.src || !files.src.length) { errors.push('it should specify at least one file in "src"'); }
				if (!files.dest || typeof files.dest !== "string") { errors.push('it should specify a file in "dest"'); }
			});
			if (errors.length) {
				var indent = '\n    ';
				return `${task.nameArgs} seems misconfigured:` + indent + errors.join(indent);
			}
		}

		private readFiles(filenames: string[]): string {
			return _.reduce(
				filenames,
				(memo: string, filename: string): string => memo + ";\n" + this.grunt.file.read(filename),
				""
			);
		}

		private generateExportLine(vars: string[]): string {
			var lines = _.reduce(vars, (memo: string[], currVar: string): string[] => {
				memo.push(currVar + ": " + currVar);
				return memo;
			}, []);

			return "module.exports = {\n" + lines.join(",\n") + "};";
		}

		private writeTempFile(content: string): string {
			var tempFilename: string = "gruntVarExporterTempFile" + Math.floor(100000 * Math.random()) + ".js";
			this.grunt.file.write(tempFilename, content);
			return tempFilename;
		}

		private generateDestContent(vars: string[], exports: Exports, pretty: boolean = false): string {
			return _.reduce(vars, (memo: string, currVar: string): string => {
				return memo + "var " + currVar + " = " + VarExporter.encode(exports[currVar], pretty) + ";\n";
			}, "");
		}

		private writeDestFile(filename: string, content: string): void {
			this.grunt.file.write(filename, content);
		}

		private deleteTempFile(filename: string): void {
			this.grunt.file.delete(filename);
		}

		/**
		 * JSON encoding doesn't allow regexes, but they would be nice to have
		 */
		private static encode(value: any, pretty: boolean): string {
			var regexes: {[key: string]: RegExp} = {};
			var regexCount = 0;

			var replacer = (key: any, value: any): any => {
				if (value && value.constructor && value.constructor.toString().substring(0, 15) === "function RegExp") {
					regexCount++;
					var regexKey = "____REGEX-PLACEHOLDER-" + regexCount;
					regexes[regexKey] = value;
					return regexKey;
				}

				return value;
			};

			var intermediate: string = JSON.stringify(value, replacer, pretty ? "\t" : undefined);

			return _.reduce(regexes, (memo: string, regex: RegExp, key: string): string => {
				return memo.replace("\"" + key + "\"", regex.toString());
			}, intermediate);
		}
	}
}

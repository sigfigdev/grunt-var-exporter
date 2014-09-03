/*
 * grunt-var-exporter
 * https://github.com/anchann/grunt-var-exporter
 *
 * Copyright (c) 2014 anchann
 * Licensed under the MIT license.
 */
import gruntjs = grunt;

module anchann.grunt.varExporter {
	import AsyncResultCatcher = gruntjs.task.AsyncResultCatcher;
	import ITask              = gruntjs.task.ITask;

	interface Options {
		files:  string[];
		export: string[];
		dest:   string;
		pretty: boolean;
	}

	interface Exports {
		[key: string]: any;
	}

	export class VarExporter {
		constructor(private grunt: IGrunt) {
		}

		public registerTask(): void {
			var theThis = this;

			this.grunt.registerTask(
				"varExporter",
				"Run a bunch of files in a node sandbox, and export a subset of the local vars into a .js file.",
				// we explicitly don't want this binding, so using non-ts function literal syntax
				function() {
					var task: ITask = this;
					theThis.run.call(theThis, task);
				}
			);
		}

		public run(task: ITask): void {
			var DEFAULT_OPTIONS: Options = <any>{
				pretty: false,
			};

			var options: Options = task.options<Options>(DEFAULT_OPTIONS);
			var done: AsyncResultCatcher = task.async();

			var optionsVerficationError = VarExporter.areOptionsValid(options);
			if (optionsVerficationError !== undefined) {
				this.grunt.log.error("Error in task configuration: " + optionsVerficationError);
				done(false);
				return;
			}

			try {
				var filesContent: string  = this.readFiles(options.files);
				var exportLine:   string  = this.generateExportLine(options.export);
				var tempFilename: string  = this.writeTempFile(filesContent + "\n" + exportLine);
				var exports:      Exports = require(require("path").resolve("./" + tempFilename));
				var destContent:  string  = this.generateDestContent(options.export, exports, options.pretty);
				this.writeDestFile(options.dest, destContent);
				this.deleteTempFile(tempFilename);

				done(true);
			}
			catch (reason) {
				this.grunt.log.error(reason);
				done(false);
			}
		}

		private static areOptionsValid(options: Options): string /* or undefined */ {
			if (!options.files || !options.files.length)           return "options.files seems misconfigured, should be a non-empty array of strings.";
			if (!options.dest || typeof options.dest !== "string") return "options.dest seems misconfigured, should be a non-empty string.";
			if (!options.export || !options.export.length)         return "options.export seems misconfigured, should be a non-empty array of strings.";
			return undefined;
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
				if (value &&
					value.constructor &&
					value.constructor.toString().substring(0, 15) === "function RegExp") {
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

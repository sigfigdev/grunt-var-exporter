module.exports = function(grunt) {
	var varExporter = new anchann.grunt.varExporter.VarExporter(grunt);
	varExporter.registerTask();
};

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'scripts/**/*.js'], // TODO: Don't forget to lint the tests as well when I add them!
      options: {
        ignores: ['scripts/jquery.tmpl.js', 'scripts/jquery-1.7.1.min.js', 'scripts/knockout-2.0.0.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
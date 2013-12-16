module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'scripts/**/*.js', 'specs/**/*.js'],
      options: {
        ignores: ['scripts/jquery.tmpl.js', 'scripts/jquery-1.7.1.min.js', 'scripts/knockout-2.0.0.js']
      }
    },
    jasmine: {
      src: ['scripts/album.js'], // Just one simple file for now!
      options: {
        helpers: ['specs/spechelper.js'],
        specs: ['specs/**/*.spec.js'],
        vendor: ['scripts/knockout-2.0.0.js']
      }
    },
    watch: {
      files: ['**/*.js'],
      tasks: ['jshint', 'jasmine']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'jasmine', 'watch']);
};
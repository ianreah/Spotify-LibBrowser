module.exports = function(grunt) {
  grunt.initConfig({
    getSpotifyFolder: function() {
      var root;
      if (process.platform == 'win32') {
        root = process.env.USERPROFILE + '/Documents';
      } else {
        root = process.env.HOME;
      }

      return root + '/Spotify/Spotify-LibBrowser/';
    },
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
    clean: {
      src: ['<%= getSpotifyFolder() %>'],
      options: {
          force: true
      }
    },
    copy: {
      main: {
        src: ['manifest.json', 'index.html', 'images/*', 'scripts/*', 'styles/*'],
        dest: '<%= getSpotifyFolder() %>'
      }
    },
    watch: {
      files: ['**/*.js'],
      tasks: ['jshint', 'jasmine', 'clean', 'copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'jasmine', 'clean', 'copy', 'watch']);
};
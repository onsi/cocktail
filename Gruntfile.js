module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/* <%= pkg.author %>\n' +
            ' * <%= pkg.name %> v<%= pkg.version %>\n' +
            ' * <%= pkg.homepage %>/ */\n',
    uglify: {
      dist: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          'Cocktail-<%= pkg.version %>.min.js': '<%= pkg.main %>'
        }
      }
    },
    jasmine: {
      components: {
        src: ['Cocktail.js'],
        options: {
          specs: 'spec/spec/*Spec.js',
          keepRunner : true,
          helpers: 'spec/SpecHelper.js',
          vendor: [
            'externals/jquery-1.7.2.js',
            'externals/underscore.js',
            'externals/backbone.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.registerTask('travis', ['jasmine']);
  grunt.registerTask('default', ['jasmine', 'uglify']);
};
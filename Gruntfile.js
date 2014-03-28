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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};
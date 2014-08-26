var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'path/to/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'path/to/**/*.js'

module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    dev: '.',
    prod: 'prod'
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Project settings
    config: config,

      watch: {
        options: {
          livereload: true        
        },
				jade: {
					files: '<%= config.dev %>/jade/**/*.jade',
					tasks: ['jade', 'bowerInstall']
				},
        bower: {
          files: ['bower.json'],
          tasks: ['bowerInstall']
        },
        gruntfile: {
          files: ['Gruntfile.js']          
        },
        less: {
          files: '<%= config.dev %>/less/*.less',
          tasks: ['less', 'autoprefixer']
        },
        livereload: {
          livereload: true,
          files: [
            '<%= config.dev %>/jade/{,*/}*.jade',
            '<%= config.dev %>/{,*/}*.html',
            '<%= config.dev %>/js/{,*/}*.js',
            '<%= config.dev %>/css/{,*/}*.css'
          ]
        }
      },

			jade: {
				compile: {
					files: {
						'<%= config.dev %>/index.html': ['<%= config.dev %>/jade/index.jade'],
						'<%= config.dev %>/about/index.html': ['<%= config.dev %>/jade/about/index.jade']
					},
					options: {
						client: false,
						pretty: true,
						data: function(dest, src) {
							// Return an object of data to pass to templates
							return require('./locals.json');
						}
					}
				}
			},

      less: {
        options: {
          syncImport: true,
					// usemin is compressing when delivering style.min.css
          //compress: true,
          ieCompat: true
        },
        dev: {
          files: {
            '<%= config.dev %>/css/style.css': '<%= config.dev %>/less/style.less'
          }
        }
      },

      autoprefixer: {
        options: {
          browsers:['last 2 versions', 'ie 8', 'ie 7']
        },
        target: {
          src: '<%= config.dev %>/css/style.css',
          dest: '<%= config.dev %>/css/style.css'
        }
      },

      connect: {
        options: {
          port: 9000,
          open: true,
          livereload: 35729,
          // Change this to '0.0.0.0' to access the server from outside
          hostname: 'localhost'
        },
        livereload: {
          options: {
            middleware: function ( connect ) {
              return [
                mountFolder(connect, '.tmp'),
                mountFolder(connect, '')
              ];
            }
          }
        }
      },
      open: {
        server: {
          path: 'http://localhost:<%= connect.options.port %>'
        }
      },

      imagemin: {
        target: {
          options: {
            optimizationLevel: 7
          },
          files: [{
            expand: true,
            cwd: '<%= config.dev %>/img',
            src: '*.{png,jpg,jpeg}',
            dest: '<%= config.prod %>/prod/img'
          }]
        }
      },

			// Automatically inject Bower components into the HTML file
      bowerInstall: {
				dist: {
					src:[
						// '<%= config.dev %>/jade/inc/header.jade',
						// '<%= config.dev %>/jade/inc/footer.jade',
						// '<%= config.dev %>/jade/index.jade'
						'<%= config.dev %>/{,*/}*.html'
					]
				}
      },

			rev: {
				dist: {
					files: {
						src: [
							'<%= config.prod %>/js/{,*/}*.js',
							'<%= config.prod %>/css/{,*/}*.css',
							'<%= config.prod %>/img/{,*/}*.*',
							'<%= config.prod %>/*.{ico,png}'
						]
					} 
				}
			},

      // Rreads HTML for usemin blocks to enable smart builds that automatically 
      // concat, minfy and revision files. Creates configurations in memory so
      // additional tasks can operate on them
      useminPrepare: {
        options: {
          dest: "<%= config.prod %>"                 
        },
        html: '<%= config.dev %>/index.html'
      },

      // Performs rewrites based on rev and the useminPrepare configuration
      usemin: {
        options: {
          assetsDirs: ['<%= config.prod %>', '<%= config.prod %>/img']          
        },
        html: ['<%= config.prod %>/{,*/}*.html'],
        css: ['<%= config.prod %>/css/{,*/}*.css']
      },

      rsync: {
        options: {
          args: ["--verbose"],
          exclude: ["less", "*~", "*.swp", ".*", "node_modules", "prod", "bower_components", "Gruntfile.js", "package.json", "bower.json", "*.md", "jade", "*.json"],
          recursive: true
        },
        dist: {
          options: {
            src: "<%= config.dev %>",
            dest: "<%= config.prod %>"
          }
        }
      }
  });

  // load plugins
  // require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // default task(s)
  grunt.registerTask('default', function() {
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });
  
  grunt.registerTask('build', function() {
    grunt.task.run([
      'useminPrepare',
      'concat',
      'cssmin',
      'uglify',
      'rsync',
      'rev',
      'usemin',
      'imagemin:target'
    ]);
  });
};

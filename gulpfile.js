//////////////////////
// Convention names //
//////////////////////
var development  = 'DEV',        			// Development's tag name
    distribution = 'DIST',      			// Distribution's tag name
    plugin_name  = "celebrity-ranking";		// Plugin name


///////////////////////////
// Environment variables //
///////////////////////////
var ENV = development,          // Environment type (development | distribution)
    PORT = 7070;                // Port's number


function isDevelopment() { return ENV === development; }
function isDistribution() { return ENV === distribution; }

var fs = require('fs-extra');
var gulp = require('gulp');
var wiredep = require('wiredep').stream;

// Loading all the pluigins in package.json
var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'main-bower-files', 'browser-sync', 'wiredep', 'del', 'browser-sync']
});

gulp.task('bower-install', function() {
	return $.bower({ directory: './bower_components'});
});
 
//////////////////////////////////////////////////////////
// Compiles, auto-prefixes and minifies all .less files //
//////////////////////////////////////////////////////////
function processLess(src, dest){
    gulp.src(src)
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.if(isDevelopment(), $.sourcemaps.init()))
    .pipe($.less())
    .pipe($.minifyCss({compatibility: 'ie8'}))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(isDevelopment(), $.sourcemaps.write()))
    .pipe(gulp.dest(dest));
}

/////////////////////////////////
// Process and minify JS files //
/////////////////////////////////
function processJS(src, dest, name){
    gulp.src(src)
    .pipe($.plumber({ errorHandler: onError }))
    .pipe($.if(isDevelopment(), $.sourcemaps.init()))
    .pipe($.concat(name))
    .pipe($.uglify())    
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(isDevelopment(), $.sourcemaps.write()))
    .pipe(gulp.dest(dest));
}





gulp.task('optimizer-js-less', function(){

	processLess('admin/less/themes.less', 'admin/css/');
	processLess('admin/less/vendors.less', 'admin/css/');
	processJS('admin/js/*.js', 'admin/js/', plugin_name + '-admin.js');

	processLess('public/less/themes.less', 'public/css/');
	processLess('public/less/vendors.less', 'public/css/');
	processJS('public/js/*.js', 'public/js/', plugin_name + '-public.js');

	$.browserSync.reload({ stream: true });
});

gulp.task('optimizer-admin-less', function(){
	processLess('admin/less/themes.less', 'admin/css/');
	processLess('admin/less/vendors.less', 'admin/css/');
	$.browserSync.reload({ stream: true });
});

gulp.task('optimizer-public-less', function(){
	processLess('public/less/themes.less', 'public/css/');
	processLess('public/less/vendors.less', 'public/css/');
	$.browserSync.reload({ stream: true });
});

gulp.task('optimizer-admin-js', function(){
	processJS('admin/js/main.js', 'admin/js/', plugin_name + '-admin.js');	
	$.browserSync.reload({ stream: true });
});

gulp.task('optimizer-public-js', function(){
	processJS('public/js/main.js', 'public/js/', plugin_name + '-public.js');
	$.browserSync.reload({ stream: true });
});

//////////////////////////////////////////////////////////////////
// Process Task inject the Bower Dependencies in the html files //
//////////////////////////////////////////////////////////////////
gulp.task('inject-bower-dep', function(){
    injectBower('admin');
    injectBower('public');
});


////////////////////////////////////////////////////////
// Process Task watch in the files: less, html, assets//
////////////////////////////////////////////////////////
gulp.task('watch', function(){
    /* Watch less */
    gulp.watch('./admin/less/theme.less',   ['optimizer-admin-less']);
    gulp.watch('./public/less/vendor.less', ['optimizer-public-less']);

    /* Watch js */
    gulp.watch('./admin/js/main.js',  ['optimizer-admin-js']);
    gulp.watch('./public/js/main.js', ['optimizer-public-js']);
});

//////////////////////
// Build and serves //
//////////////////////
gulp.task('default', function(){
  	$.runSequence( ['optimizer-js-less', 'watch']);
});
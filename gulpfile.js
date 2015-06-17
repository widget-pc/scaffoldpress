//////////////////////
// Convention names //
//////////////////////
var development = 'DEV',        // Development's tag name
    distribution = 'DIST';      // Distribution's tag name

var plugin_dev = 'dev',
    plugin_dest = 'dist';

var admin_base = plugin_dev+'/admin/',
    public_base = plugin_dev+'/public/';


var admin_dest = plugin_dest+'/admin/',
    public_dest = plugin_dest+'/public/';

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

var bower = require('gulp-bower');
gulp.task('bower-install', function() {
  return bower({ directory: './bower_components'});
});
 


var jsSources = [public_base+'js/*.js', admin_base+'js/*.js'];


function processSrc(src, name, type, dest){
    gulp.src(src)
    .pipe($.if(isDevelopment(), $.sourcemaps.init()))
    .pipe($.concat(name+'.'+type))
    .pipe($.if(type=='js', $.uglify()))
    .pipe($.if(type=='css', $.less()))
    .pipe($.if(type=='css', $.minifyCss({compatibility: 'ie8'})))
    .pipe($.if(type=='css', $.if(isDevelopment(), $.csso())))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(isDevelopment(), $.sourcemaps.write()))
    .pipe(gulp.dest(dest+type));

}


//////////////////////////////////////////////////////////
// Compiles, auto-prefixes and minifies all .less files //
//////////////////////////////////////////////////////////
gulp.task('optimizer-js-less', function() {

  processSrc(admin_base+'less/themes.less', 'themes', 'css', admin_dest);
  processSrc(admin_base+'less/vendors.less', 'vendors', 'css', admin_dest);
  processSrc(admin_base+'scripts/*.js', 'app', 'js', admin_dest);

  processSrc(public_base+'less/themes.less', 'themes', 'css', public_dest);
  processSrc(public_base+'less/vendors.less', 'vendors', 'css', public_dest);
  processSrc(public_base+'scripts/*.js', 'app', 'js', public_dest);

  $.browserSync.reload({ stream: true });


});



function installBowerIn(type){
  return gulp.src('dev/'+type+'/class-plugin-name-'+type+'.php')
    .pipe(wiredep({
      directory: './bower_components',
      exclude: [],
    }))
    .pipe(gulp.dest('dev/'+type+'/'));
}

//////////////////////////////
// Injects bower components //
//////////////////////////////
gulp.task('bower', function() {
  installBowerIn('admin');
  installBowerIn('public');
});



function injectBower(type){


  var css = $.filter('**/*.css'),
        js  = $.filter('**/*.js'),
        assets = $.useref.assets(),
        stream = gulp.src('dev/'+type+'/class-plugin-name-'+type+'.php');

    return stream.pipe(assets)                              // Select all assets in the 'build' tag in the html file
                 .pipe(css)                                 // Select only .css assets
                 .pipe($.minifyCss({compatibility: 'ie8'})) // Minify or other changes
                 .pipe(css.restore())                       // Rollback css filter
                 .pipe(js)                                  // Select only .js assets
                 .pipe($.uglify())                                           // Uglify or other changes
                 .pipe(js.restore())                        // Rollback js filter
                 // .pipe($.rev())                          // Rename vendor.js and vendor.js files
                 .pipe(assets.restore())                    // Restore all assets
                 //.pipe($.useref())                          // Make changes in the html file links and script
                 // .pipe($.revReplace())                   // Update in files the correct name change by rev()
                 .pipe(gulp.dest('./dist/'+type));   // Save ides.html, vendor.js and vendor.js files

}


//////////////////////////////////////////////////////////////////
// Process Task inject the Bower Dependencies in the html files //
//////////////////////////////////////////////////////////////////
gulp.task('inject-bower-dep', function () {

    injectBower('admin');
    injectBower('public');
});



///////////////////////////////
// Process all FONTS files   //
///////////////////////////////
gulp.task('fonts', function(){
    gulp.src('dev/assets/fonts/**')
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.browserSync.reload({ stream: true }));
});


////////////////////////////////
// Process all IMAGES files   //
////////////////////////////////
gulp.task('images', function(){
    gulp.src('dev/assets/images/**')
        .pipe(gulp.dest('dist/images'))
        .pipe($.browserSync.reload({ stream: true }));
});


///////////////////////////////
// Process all ICONS files   //
///////////////////////////////
gulp.task('icons', function(){
    gulp.src('dev/assets/icons/**')
        .pipe(gulp.dest('dist/icons'))
        .pipe($.browserSync.reload({ stream: true }));
});

//////////////////////////////////
//  Process all PHP admin files //
//////////////////////////////////
gulp.task('php-admin-change', function(){
    gulp.src('dev/admin/*.php')
        .pipe(gulp.dest('dist/admin'))
        .pipe($.browserSync.reload({ stream: true }));
});

///////////////////////////////////
//  Process all PHP public files //
///////////////////////////////////
gulp.task('php-public-change', function(){
    gulp.src('dev/public/*.php')
        .pipe(gulp.dest('dist/public'))
        .pipe($.browserSync.reload({ stream: true }));
});


/////////////////////////////////////
// Delete the idstribution folder  //
/////////////////////////////////////
gulp.task('assets',function(){
  $.runSequence(['fonts','images','icons']);
});


//////////////////////////////////////
// Process Task delete folder dist  //
//////////////////////////////////////
gulp.task('delete',function(){
    // 'plugin-name/images',
    $.del(['dist/fonts', 'dist/images', 'dist/icons']);
});


//////////////////////////////////////
// Process Task delete folder dist  //
//////////////////////////////////////
gulp.task('copy-base',function(){
   
  fs.copy('./dev/index.php', './index.php', function (err) {
    if (err) return console.error(err)
    console.log("success!")
  }); // copies file 

  fs.copy('./dev/plugin-name.php', './plugin-name.php', function (err) {
    if (err) return console.error(err)
    console.log("success!")
  }); // copies file 

  fs.copy('./dev/uninstall.php', './uninstall.php', function (err) {
    if (err) return console.error(err)
    console.log("success!")
  }); // copies file 
   
  fs.copy('./dev/includes', './dist/includes', function (err) {
    if (err) return console.error(err)
    console.log('success!')
  }); // copies directory, even if it has subdirectories or files

  fs.copy('./dev/languages', './dist/languages', function (err) {
    if (err) return console.error(err)
    console.log('success!')
  }); // copies directory, even if it has subdirectories or files

  console.log('files copied');
});


// browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    //watch files
    var files = [
        './dist/**/*.*' //this is for watching all files in all routes inside the dist folder of the plugin.
    ];
 
    //initialize browsersync
    $.browserSync.init(files, {
        //browsersync with a php server
        proxy: "localhost/wordpress_desarrollo/",
        notify: false
    });
});


gulp.task('browser-reload', function() {
  $.browserSync.reload({ stream: true });
});


////////////////////////////////////////////////////////
// Process Task watch in the files: less, html, assets//
////////////////////////////////////////////////////////
gulp.task('watch', function(){
    gulp.watch('./dev/**/*{.less, .js, .css }', ['optimizer-js-less']);
    gulp.watch('./dev/admin/*.php', ['php-admin-change']);
    gulp.watch('./dev/public/*.php', ['php-public-change']);
    gulp.watch('bower.json', ['bower-install', 'bower', 'inject-bower-dep', 'browser-reload']);
    gulp.watch('./dev/assets/fonts/**/*', ['fonts']);
    gulp.watch('./dev/assets/icons/**/*', ['icons']);
    gulp.watch('./dev/assets/images/**/*', ['images']);
});






//////////////////////
// Build and serves //
//////////////////////
gulp.task('default', function() {
  //gulp.app;
  $.runSequence('copy-base', 'bower', 'optimizer-js-less','inject-bower-dep', 'assets', 'browser-sync', 'watch');

});
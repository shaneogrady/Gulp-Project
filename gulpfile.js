var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    imageResize = require('gulp-image-resize'),
    notify = require('gulp-notify'),
    pngcrush = require('imagemin-pngcrush'),
    del = require('del'),
    git = require ('gulp-git'),
    prompt = require ('gulp-prompt'),
    concat = require('gulp-concat'),
    server = require('gulp-server-livereload');

var env,
    coffeeSources,
    jsSources,
    sassSources,
    htmlSources,
    jsonSources,
    outputDir,
    sassStyle;

env = process.env.NODE_ENV || 'development';

if (env==='development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/tagline.coffee'];
jsSources = [
  'components/scripts/rclick.js',
  'components/scripts/pixgrid.js',
  'components/scripts/tagline.js',
  'components/scripts/template.js'
];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];


gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

/*
gulp.task('webserver', function() {
  gulp.src('app')
    .pipe(server({
      root: outputDir,
      livereload: true,
      directoryListing: true,
      open: true
    }));
});


gulp.task('imageResize', function () {
  gulp.src('builds/development/images/socialmedia/*.*')
    .pipe(imageResize({
      width : 10,
      height : 10,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest(outputDir + 'images/socialmedia'));
});
*/

gulp.task('coffee', function() {
  gulp.src(coffeeSources)
    .pipe(coffee({ bare: true })
    .on('error', gutil.log))
    .pipe(gulp.dest('components/scripts'))
});

gulp.task('js', function() {
  gulp.src(jsSources)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload())
});

gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      image: outputDir + 'images',
      style: sassStyle
    })
    .on('error', gutil.log))
    .pipe(gulp.dest(outputDir + 'css'))
    .pipe(connect.reload())
});

gulp.task('html', function() {
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
    .pipe(notify({ message: 'HTML task complete' }))
});

gulp.task('images', function() {
  gulp.src('builds/development/images/**/*.*')
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
    .pipe(notify({ message: 'Image Conpressed' }))
});

gulp.task('imageSmall', function () {
  gulp.src('builds/development/images/imageResize/*.*')
    .pipe(imageResize({
      width : 300,
      height : 300,
      crop : false,
      upscale : false
    }))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload());
});

gulp.task('imageLarge', function () {
  gulp.src('builds/development/images/imageResize/*.*')
    .pipe(imageResize({
      width : 1000,
      height : 1000,
      crop : false,
      upscale : false
    }))
    .pipe(gulp.dest('builds/production/images/imageResize/large'));
});

gulp.task('imageMedium', function () {
  gulp.src('builds/development/images/imageResize/b/*.*')
    .pipe(imageResize({
      width : 640,
      height : 600,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('builds/production/images/imageResize/medium'));
});

gulp.task('json', function() {
  gulp.src('builds/development/js/*.json')
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
    .pipe(connect.reload())
});



//git init task
gulp.task('init', function(){
  git.init();
});

gulp.task('add', function(){
  gulp.src([ '!node_modules/', './*' ])
  .pipe(git.add());
});

// Commit files
gulp.task('committest', function(){
  gulp.src([ '!node_modules/', './*' ], {buffer:false})
  .pipe(git.commit('test commit'));
});

//git commit task with gulp prompt
gulp.task('commit', function(){
    gulp.src('package.json')
    .pipe(prompt.prompt({
        type: 'input',
        name: 'commit',
        message: 'Please enter commit message...'
    },  function(res){
      return gulp.src([ '!node_modules/', './*' ], {buffer:false})
      .pipe(git.commit(res.commit));
    }));
});


gulp.task('clean', function(cb) {
    del(['builds/production/css/*.*', 'builds/production/js/*.*', 'builds/production/images/**/*.*'], cb)
});

gulp.task('watch', function() {
  gulp.watch(coffeeSources, ['coffee']);
  gulp.watch(jsSources, ['js']);
  gulp.watch('components/sass/*.scss', ['compass']);
  gulp.watch('builds/development/*.html', ['html']);
  gulp.watch('builds/development/js/*.json', ['json']);
  gulp.watch('builds/development/images/**/*.*', ['images']);
});

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);

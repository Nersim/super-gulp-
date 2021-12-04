const { src, dest, watch, series, parallel } = require('gulp');


const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const fileInclude = require('gulp-file-include')
const del = require('del');
const htmlmin = require('gulp-htmlmin');


function browsersync() {
   browserSync.init({
      server: {
         baseDir: 'app/'
      }
   });
}


function clean() {
   return del('app/*')
}

function imagesTent() {
   return src([
      './src/img/**.jpg',
      './src/img/**.png',
      './src/img/**.jpeg',
      './src/img/*.svg',
      './src/img/**/*.jpg',
      './src/img/**/*.png',
      './src/img/**/*.jpeg',
      '.src/img/**/*.svg',
   ])
      .pipe(dest('app/img'))
}
function imagesProd() {
   return src([
      './app/img/**.jpg',
      './app/img/**.png',
      './app/img/**.jpeg',
      './app/img/*.svg',
      './app/img/**/*.jpg',
      './app/img/**/*.png',
      './app/img/**/*.jpeg',
      '.app/img/**/*.svg',
   ])
      .pipe(imagemin(
         [
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
               plugins: [
                  { removeViewBox: true },
                  { cleanupIDs: false }
               ]
            })
         ]
      ))
      .pipe(dest('dist/img'))
}

function htmlInclude() {
   return src(['./src/*.html'])
      .pipe(fileInclude({
         prefix: '@',
         basepath: '@file'
      }))
      .pipe(dest('./app'))
      .pipe(browserSync.stream())
}

function scripts() {
   return src([

      'src/js/main.js',
   ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
}

function resources() {
   return src('./src/resources/**')
      .pipe(dest('./app'))
}

function styles() {
   return src('src/scss/style.scss')
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
         overrideBrowserslist: ['last 10 version'],
         grid: true
      }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
};

function build() {
   return src([
      'app/css/style.min.css',
      'app/resources/**/*',
      'app/js/main.min.js',


   ], { base: 'app' })
      .pipe(dest('dist'))
}


function watching() {
   watch(['src/scss/**/*.scss'], styles)
   watch(['src/js/**/*.js', '!app/js/main.min.js'], scripts)
   watch('./src/partials/*.html', htmlInclude);
   watch('./src/*.html', htmlInclude);
   watch('./src/resources/**', resources);
   watch('./src/img/*.{jpg,jpeg,png,svg}');
   watch('./src/img/**/*.{jpg,jpeg,png}');
   watch(['app/*.html']).on('change', browserSync.reload);
}

function htmlMinify() {
   return src('app/*.html')
      .pipe(htmlmin({
         collapseWhitespace: true
      }))
      .pipe(dest('dist'));

}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.build = build;
exports.imagesProd = imagesProd;
exports.clean = clean;
exports.htmlInclude = htmlInclude;
exports.imagesTent = imagesTent;
exports.htmlMinify = htmlMinify;
exports.resources = resources;

exports.build = series(clean, imagesProd, htmlMinify, build)
exports.default = parallel(htmlInclude, scripts, styles, resources, imagesTent, browsersync, watching)

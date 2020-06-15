// npm i -D gulp gulp-if gulp-plumber browser-sync gulp-rigger gulp-sass gulp-sourcemaps gulp-postcss autoprefixer cssnano gulp-concat gulp-uglify vinyl-ftp gulp-util
// npm i normalize.css jquery

'use strict';

const gulp = require('gulp');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const browsersync = require('browser-sync').create();
const rigger = require('gulp-rigger');

const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const path = {
    public: {
        html: 'public',
        css: 'public/css',
        js: 'public/js',
        img: 'public/img',
        fonts: 'public/fonts',
        video: 'public/video',
    }
};

const production = false;

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: path.public.html
        },
        port: 3000
    });
    done();
}

function html() {
    return gulp.src('src/html/*.html')
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.public.html))
        .pipe(browsersync.stream())
}

function css() {
    return gulp.src('src/scss/style.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            indentWidth: 4
        }))
        .pipe(sourcemaps.write())
        .pipe(
            gulpif(production, postcss([
                autoprefixer(),
                cssnano()
            ]))
        )
        .pipe(gulp.dest(path.public.css))
        .pipe(browsersync.stream())
}

function js() {
    return gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(gulpif(production, uglify()))
        .pipe(gulp.dest(path.public.js))
        .pipe(browsersync.stream())
}

function jsLibs() {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
    ])
    .pipe(gulpif(production, uglify()))
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(path.public.js))
    .pipe(browsersync.stream())
}

function img() {
    return gulp.src('src/img/**/*')
        .pipe(gulp.dest(path.public.img))
        .pipe(browsersync.stream())
}

function fonts() {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest(path.public.fonts))
        .pipe(browsersync.stream())
}

function video() {
    return gulp.src('src/video/**/*')
        .pipe(gulp.dest(path.public.video))
        .pipe(browsersync.stream())
}

function watch() {
    gulp.watch('src/html/**/*.html', html);
    gulp.watch('src/scss/**/*.scss', css);
    gulp.watch('src/js/**/*.js', js);
    gulp.watch('src/img/**/*', img);
    gulp.watch('src/fonts/**/*', fonts);
    gulp.watch('src/video/**/*', video);
}

exports.default = gulp.series(
    gulp.parallel(
        html, css, js, jsLibs, img, fonts, video,
    ),
    browserSync,
    watch
);
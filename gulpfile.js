// npm i -D gulp gulp-if gulp-plumber browser-sync gulp-rigger gulp-sass gulp-sourcemaps gulp-postcss autoprefixer cssnano gulp-concat gulp-uglify del vinyl-ftp gulp-util
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

const del = require('del');
const ftp = require('vinyl-ftp');
const gutil = require('gulp-util');

const name = 'gulp-template';
const production = false;
const path = {
    src: {
        html: 'src/html',
        css: 'src/scss',
        js: 'src/js',
        img: 'src/img',
        fonts: 'src/fonts',
        video: 'src/video',
    },
    public: {
        html: 'public',
        css: 'public/css',
        js: 'public/js',
        img: 'public/img',
        fonts: 'public/fonts',
        video: 'public/video',
    }
};
const conn = ftp.create({
    host:     '',
    user:     '',
    password: '',
    parallel: 1,
    log:      gutil.log
});

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
    return gulp.src(`${path.src.html}/*.html`)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.public.html))
        .pipe(browsersync.stream())
}

function css() {
    return gulp.src(`${path.src.css}/style.scss`)
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
    return gulp.src(`${path.src.js}/**/*`)
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
    return gulp.src(`${path.src.img}/**/*`)
        .pipe(gulp.dest(path.public.img))
        .pipe(browsersync.stream())
}

function fonts() {
    return gulp.src(`${path.src.fonts}/**/*`)
        .pipe(gulp.dest(path.public.fonts))
        .pipe(browsersync.stream())
}

function video() {
    return gulp.src(`${path.src.video}/**/*`)
        .pipe(gulp.dest(path.public.video))
        .pipe(browsersync.stream())
}

function watch() {
    gulp.watch(`${path.src.html}/**/*.html`, html);
    gulp.watch(`${path.src.css}/**/*.scss`, css);
    gulp.watch(`${path.src.js}/**/*`, js);
    gulp.watch(`${path.src.img}/**/*`, img);
    gulp.watch(`${path.src.fonts}/**/*`, fonts);
    gulp.watch(`${path.src.video}/**/*`, video);
}

function clean() {
    return del(['public']);
}

function cleanFtp(done) {
    return conn.rmdir(name, done)
}

function deploy() {
    return gulp.src(['public/**'], {base: './public', buffer: false})
        .pipe(conn.dest(name));
}

const build = gulp.series(
    clean,
    gulp.parallel(html, css, js, jsLibs, img, fonts, video)
);

exports.build = build;
exports.deploy = gulp.series(build, cleanFtp, deploy);
exports.default = gulp.series(build, browserSync, watch);
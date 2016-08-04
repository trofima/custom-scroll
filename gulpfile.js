'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const concatCss = require('gulp-concat-css');
const uglify = require('uglify-js-harmony');
const minifer = require('gulp-uglify/minifier');
const uglifyCss = require('gulp-uglifycss');
const jasmine = require('gulp-jasmine');

function throwPluginError(err) {
    console.error(
        'ERROR:\nplugin %s has thrown an error: %s\nCall stack:\n%s',
        err.plugin, err.message, err.stack
    );

    return process.exit(1);
}

function compileTs() {
    const tsProject = ts.createProject('tsconfig.json');

    return tsProject
        .src()
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest('./compiled'));
}

function compileSass() {
    return gulp.src('./src/**/*.scss')
        .pipe(sass()
            .on('error', throwPluginError))
        .pipe(gulp.dest('./compiled/src/'));
}

function minJs() {
    return gulp.src('./compiled/src/**/*.js')
        .pipe(concat('bundle.min.js')
            .on('error', throwPluginError))
        .pipe(minifer({}, uglify)
            .on('error', throwPluginError))
        .pipe(gulp.dest('./dist/'));
}

function minCss() {
    return gulp.src('./compiled/**/*.css')
        .pipe(concatCss('bundle.min.css')
            .on('error', throwPluginError))
        .pipe(uglifyCss()
            .on('error', throwPluginError))
        .pipe(gulp.dest('./dist/'));
}

function declareTs() {
    return gulp.src('./src/**/*.ts')
        .pipe(ts({declaration: true}))
        .dts.pipe(concat('bundle.d.ts')
            .on('error', throwPluginError))
        .pipe(gulp.dest('./dist/'));
}

function test() {
    return gulp.src('./compiled/spec/**/*.spec.js')
        .pipe(jasmine()
            .on('error', throwPluginError))
}

gulp
    .task('compile-ts', compileTs)
    .task('compile-sass', compileSass)

    .task('build-js', ['compile-ts'], minJs)
    .task('build-css', ['compile-sass'], minCss)
    .task('declare-ts', declareTs)

    .task('test', ['compile-ts'], test)

    .task('build', ['build-js', 'build-css', 'declare-ts'])
    
    .task('default', ['build']);

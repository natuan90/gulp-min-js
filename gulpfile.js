/**
 * Description: Min js
 * Company: HTV
 * Author: TuanNA
 * Date: 01/09/2019
 */
const del         = require('del');
const gulp        = require('gulp');
const cache       = require('gulp-cache');
const gulpIf      = require('gulp-if');
const useref      = require('gulp-useref');
const uglify      = require('gulp-uglify-es').default;
const runSequence = require('run-sequence');
const rename      = require('gulp-rename');

const path = {
    src    : 'src',
    dist    : 'dist',
    distJs : 'dist',
    srcJs  : 'src/js/*',
}

// -----------------------------------
// Optimization Tasks
// -----------------------------------
gulp.task('useref', function () {
    return gulp.src(path.srcJs)
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.distJs));
});

gulp.task('clean:cache', function (cb) {
    return cache.clearAll(cb);
})

gulp.task('clean:dist', function () {
    return del.sync([path.dist]);
});

// -----------------------------------
// Build Sequences
// --------------------------------

gulp.task('build', function (callback) {
    runSequence( 'clean:cache', 'clean:dist', ['useref'], callback )
});
var gulp = require('gulp');


gulp.task('default', ['api', 'cdn', 'www']);

gulp.task('api', function () {
    return gulp.src('api/**')
        .pipe(gulp.dest('dist/api'));
});

gulp.task('cdn', function () {
	return gulp.src('cdn/**')
        .pipe(gulp.dest('dist/cdn'));
});

gulp.task('www', function () {
    return gulp.src('www/**')
        .pipe(gulp.dest('dist/www'));
});

var gulp = require('gulp');
var git = require('gulp-git');


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


function deploy (cwd, url, cb) {
    var options = {
        cwd: cwd
    };

    function init () {
        return git.init(options, add);
    }

    function add (err) {
        if (err) return cb(err);

        return git.exec({
            args: 'add .',
            cwd: options.cwd
        }, commit);
    }

    function commit (err) {
        if (err) return cb(err);

        var name = 'Git Deployr';
        var email = 'gitdeployr@make-pizza.info';

        process.env['GIT_COMMITTER_NAME'] = name;
        process.env['GIT_COMMITTER_EMAIL'] = email;
        return git.exec({
            args: 'commit --message "intial commit" --author "' + name + ' <' + email + '>"',
            cwd: options.cwd
        }, addRemote);
    }

    function addRemote (err) {
        if (err) return cb(err);

        return git.addRemote('azure', url, options, push);
    }

    function push (err) {
        if (err) return cb(err);

        return git.push('azure', 'master', options, cb);
    }

    return init();
}

gulp.task('deploy', ['default'], function (cb) {
    var items = {
        'dist/api': 'https://gitdeployr@make-pizza-info-api.scm.azurewebsites.net:443/make-pizza-info-api.git',
        'dist/cdn': 'https://gitdeployr@make-pizza-info-cdn.scm.azurewebsites.net:443/make-pizza-info-cdn.git',
        'dist/www': 'https://gitdeployr@make-pizza-info-www.scm.azurewebsites.net:443/make-pizza-info-www.git'
    };

    function next (err) {
        if (err) return cb(err);

        for (var cwd in items) {
            var url = items[cwd];
            delete items[cwd];
            return deploy(cwd, url, next);
        }

        return cb();
    }

    return next();
});

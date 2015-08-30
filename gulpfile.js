var fs = require('fs');
var gulp = require('gulp');
var durandal = require('gulp-durandal');
var git = require('gulp-git');
var htmlreplace = require('gulp-html-replace');
var ignore = require('gulp-ignore');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var simplerename = require('gulp-simple-rename');
var webserver = require('gulp-webserver');


var js = [];


gulp.task('default', ['api', 'cdn', 'www', '404', 'favicon']);

gulp.task('api', function () {
    return gulp.src('api/**')
        .pipe(gulp.dest('dist/api'));
});

gulp.task('cdn', function () {
	return gulp.src('cdn/**')
        .pipe(gulp.dest('dist/cdn'));
});

gulp.task('durandal', function () {
    return durandal({
            almond: true,
            minify: true
        })
        .pipe(ignore.exclude('*.map'))
        .pipe(replace(/\/\/#.*$/gm, ''))
        .pipe(rev())
        .pipe(simplerename(function (_, file) {
            var path = 'js/' + file.revHash + '.js'
            js.push('https://cdn.make-pizza.info/' + path);
            return path;
        }))
        .pipe(gulp.dest('dist/cdn'));
});

gulp.task('www', function () {
    return gulp.src('www/**')
        .pipe(gulp.dest('dist/www'));
});

gulp.task('404', ['durandal'], function () {
    return gulp.src('404.html')
        .pipe(htmlreplace({
            js: js
        }))
        .pipe(gulp.dest('dist/www'));
});

gulp.task('favicon', function () {
    return gulp.src('favicon.ico')
        .pipe(gulp.dest('dist/www'));
});


gulp.task('webserver', function () {
    return gulp.src('.')
      .pipe(webserver({
          fallback: '/404.html'
      }));
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

        if (process.env['AZURE_GIT_PASSWORD']) {
            var filename = '/tmp/git-askpass.sh';
            fs.writeFileSync(filename, '#!/bin/sh\nexec /bin/echo $AZURE_GIT_PASSWORD\n', { mode: 0700 });
            process.env['GIT_ASKPASS'] = filename;
        }

        return git.push('azure', '+master', options, cb);
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

require('es6-promise').polyfill();

var fs = require('fs');
var gulp = require('gulp');
var durandal = require('gulp-durandal');
var git = require('gulp-git');
var htmlreplace = require('gulp-html-replace');
var gulpif = require('gulp-if');
var ignore = require('gulp-ignore');
var intern = require('gulp-intern');
var jshint = require('gulp-jshint');
var postcss = require('gulp-postcss');
var postcssimport = require('postcss-import');
var postcssnano = require('cssnano');
var postcssnested = require('postcss-nested');
var postcsssimplevars = require('postcss-simple-vars');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var revcssurl = require('gulp-rev-css-url');
var simplerename = require('gulp-simple-rename');
var webserver = require('gulp-webserver');
var sri = require('sri');


var css = [];
var js = [];


function isExtension (file, extension) {
    return file.history[0].endsWith(extension);
}

function isCss (file) {
    return isExtension(file, '.css');
}

function isJpeg (file) {
    return isExtension(file, '.jpeg');
}


gulp.task('api', function () {
    return gulp.src(['api/**', 'web.config', 'trace.json'])
        .pipe(gulp.dest('dist/api'));
});

gulp.task('cdn', function () {
    return gulp.src(['cdn/**', 'web.config', 'trace.json'])
        .pipe(gulp.dest('dist/cdn'));
});

function css_pipe (processors) {
    processors.unshift(postcsssimplevars);
    processors.unshift(postcssnested);
    processors.unshift(postcssimport({ glob: true }));
    return postcss(processors);
}

gulp.task('css-watch', function () {
    return gulp.src('app/main.css')
        .pipe(css_pipe([]))
        .pipe(gulp.dest('dist'));
});

gulp.task('css-deploy', function () {
    return gulp.src(['jpe[g]/*.jpeg', 'app/main.css'])
        .pipe(gulpif(isCss, css_pipe([postcssnano()])))
        .pipe(rev())
        .pipe(gulpif(isJpeg, simplerename(function (_, file) {
            var newPath = 'jpeg/' + file.revHash + '.jpeg';
            return newPath;
        })))
        .pipe(revcssurl())
        .pipe(gulpif(isCss, simplerename(function (_, file) {
            var newPath = 'css/' + file.revHash + '.css';
            var integrity = sri.getSRIString(file.contents);
            css.push(['https://cdn.make-pizza.info/' + newPath, integrity]);
            return newPath;
        })))
        .pipe(gulp.dest('dist/cdn'));
});

gulp.task('durandal', function () {
    return durandal({
            almond: true,
            minify: true,
            extraModules: [
                'plugins/widget'
            ],
            pluginMap: {
                '.html': 'text'
            }
        })
        .pipe(ignore.exclude('*.map'))
        .pipe(replace(/^([^'"]*?)\/\/#.*$/gm, '$1'))
        .pipe(rev())
        .pipe(simplerename(function (_, file) {
            var newPath = 'js/' + file.revHash + '.js';
            var integrity = sri.getSRIString(file.contents);
            js.push(['https://cdn.make-pizza.info/' + newPath, integrity]);
            return newPath;
        }))
        .pipe(gulp.dest('dist/cdn'));
});

gulp.task('www', function () {
    return gulp.src(['www/**', 'web.config', 'trace.json', 'favicon.ico', 'noscript.txt'])
        .pipe(gulp.dest('dist/www'));
});

gulp.task('404', ['css-deploy', 'durandal'], function () {
    return gulp.src('error.404')
        .pipe(htmlreplace({
            css: {
                src: css,
                tpl: '<link rel="stylesheet" href="%s" crossorigin="use-credentials" integrity="%s">'
            },
            js: {
                src: js,
                tpl: '<script src="%s" crossorigin="use-credentials" integrity="%s"></script>'
            }
        }))
        .pipe(gulp.dest('dist/www'));
});


gulp.task('jshint', function () {
    return gulp.src(['gulpfile.js', 'app/**/*.js', 'tests/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', function () {
    return gulp.src('')
        .pipe(intern());
});


gulp.task('watch', ['css-watch'], function () {
    gulp.watch(['app/**/*.css'], ['css-watch']);
    gulp.watch(['app/**/*.js', 'tests/**/*.js'], ['jshint', 'test']);

    return gulp.src('.')
      .pipe(webserver({
          fallback: '/error.404'
      }));
});


gulp.task('build', ['api', 'cdn', 'www', '404', 'jshint', 'test']);


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

        process.env.GIT_COMMITTER_NAME = name;
        process.env.GIT_COMMITTER_EMAIL = email;
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

        if (process.env.AZURE_GIT_PASSWORD) {
            var filename = '/tmp/git-askpass.sh';
            fs.writeFileSync(filename, '#!/bin/sh\nexec /bin/echo $AZURE_GIT_PASSWORD\n', { mode: 0700 });
            process.env.GIT_ASKPASS = filename;
        }

        return git.push('azure', '+master', options, cb);
    }

    return init();
}

gulp.task('deploy', function (cb) {
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

requirejs.config({
    paths: {
        text: '../node_modules/durandal/node_modules/requirejs-text/text',
        durandal: '../node_modules/durandal/js',
        jquery: '../node_modules/durandal/node_modules/jquery/dist/jquery.min',
        knockout: '../node_modules/durandal/node_modules/knockout/build/output/knockout-latest',
        plugins: '../node_modules/durandal/js/plugins'
    }
});

require(['durandal/app'], function (durandal) {
    durandal.title = 'Make Pizza!';

    durandal.configurePlugins({
        widget: true
    });

    durandal.start().done(function () {
        durandal.setRoot('shell');
    });
});
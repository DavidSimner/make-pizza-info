requirejs.config({
    paths: {
        text: '../node_modules/durandal/node_modules/requirejs-text/text',
        durandal: '../node_modules/durandal/js',
        jquery: '../node_modules/durandal/node_modules/jquery/dist/jquery.min',
        knockout: '../node_modules/durandal/node_modules/knockout/build/output/knockout-latest',
        'plugins/history': '../node_modules/durandal/js/plugins/history',
        'plugins/router': '../node_modules/durandal/js/plugins/router',
        'plugins/widget': '../node_modules/durandal/js/plugins/widget'
    }
});

require(['durandal/app'], function (durandal) {
    durandal.title = 'Make Pizza!';

    durandal.configurePlugins({
        router: true,
        widget: true
    });

    durandal.start().done(function () {
        durandal.setRoot('shell');
    });
});
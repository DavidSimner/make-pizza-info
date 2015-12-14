requirejs.config({
    paths: {
        text: '../node_modules/durandal/node_modules/requirejs-text/text',
        durandal: '../node_modules/durandal/js',
        jquery: '../node_modules/durandal/node_modules/jquery/dist/jquery.min',
        knockout: '../node_modules/durandal/node_modules/knockout/build/output/knockout-latest',
        lodash: '../node_modules/lodash/index',
        xr: '../node_modules/xr/xr',
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

    console.log('%cStop!', 'color:red;font-family:sans-serif;font-size:96px');
    console.log('%cIf someone told you to copy and paste something here, it is a scam, and will give them access to your account.', 'font-family:sans-serif;font-size:20px');
    console.log('%cFor more information, see https://en.wikipedia.org/wiki/Self-XSS', 'font-family:sans-serif;font-size:20px');
});
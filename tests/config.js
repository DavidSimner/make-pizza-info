define({
    suites: [
        'tests/modules/home'
    ],
    loaders: {
        'host-node': 'durandal/node_modules/requirejs'
    },
    basePath: 'app',
    loaderOptions: {
        paths: {
            'tests': '../tests'
        }
    },
    excludeInstrumentation: /\/node_modules\//
});
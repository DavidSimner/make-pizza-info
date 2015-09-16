define({
    suites: [
        'tests/infrastructure/web-config',
        'tests/modules/contact',
        'tests/modules/home',
        'tests/modules/not-found',
        'tests/modules/recipe',
        'tests/modules/recipe-group',
        'tests/modules/trace',
        'tests/widgets/header',
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
define(['plugins/router'], function (router) {
    function Shell() {
    }

    Shell.prototype.activate = function () {
        return router.map([
            { route: '',                        moduleId: 'modules/home/index' },
            { route: 'contact',                 moduleId: 'modules/contact/index' },
            { route: 'recipe/:recipeId',        moduleId: 'modules/recipe/index' },
            { route: 'recipes/:recipeGroupId',  moduleId: 'modules/recipe-group/index' },
            { route: 'trace',                   moduleId: 'modules/trace/index' },
        ])
        .mapUnknownRoutes('modules/not-found/index', 'not-found')
        .on('router:navigation:complete', function () {
            window.scrollTo(0, 0);
        })
        .activate({
            pushState: true
        });
    };

    return Shell;
});
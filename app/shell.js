define(['knockout', 'plugins/router'], function (ko, router) {
    function Shell() {
        var throttledIsNavigating = ko.pureComputed(router.isNavigating).extend({ throttle: 1000 });
        this.showNavigating = ko.pureComputed(function () {
            return router.isNavigating() && throttledIsNavigating();
        });
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
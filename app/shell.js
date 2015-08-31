define(['plugins/router'], function (router) {
    function Shell() {
    }

    Shell.prototype.activate = function () {
        return router.map([
            { route: '', moduleId: 'modules/home/index' }
        ])
        .activate({
            pushState: true
        });
    };

    return Shell;
});
define(['intern!tdd', 'modules/not-found/index'], function (tdd, NotFoundViewModel) {
    tdd.suite('modules/not-found/index', function () {
        tdd.test('can construct', function () {
            new NotFoundViewModel();
        });
    });
});
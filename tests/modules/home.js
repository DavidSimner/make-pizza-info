define(['intern!tdd', 'modules/home/index'], function (tdd, HomeViewModel) {
    tdd.suite('modules/home/index', function () {
        tdd.test('can construct', function () {
            new HomeViewModel();
        });
    });
});
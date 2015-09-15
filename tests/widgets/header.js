define(['intern!tdd', 'widgets/header/viewmodel'], function (tdd, HeaderViewModel) {
    tdd.suite('widgets/header/viewmodel', function () {
        tdd.test('can construct', function () {
            new HeaderViewModel();
        });
    });
});